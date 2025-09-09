import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import { TxDeliveryStatus, TxManualStatus, TxMethod } from '@prisma/client';

import { db as database } from '../configs/database';
import type {
  ICreateTransactionRequest,
  ICreateTransactionResponse,
  IGetTransactionRequest,
  IGetTransactionResponse,
  ITransactionItem,
  ITransactionNotifRequest,
  IGetAllTransactionsRequest,
  IGetAllTransactionsResponse,
  IGetTransactionByUserRequest,
  IGetTransactionByUserResponse,
  IUpdateTransactionRequest,
  IUpdateTransactionResponse,
  ICancelTransactionRequest,
  ICancelTransactionResponse,
  IGetTxStatusListResponse,
  IGetTxMethodListResponse,
  ICostCheckPayload,
  IShippingOption,
  IRequestPaymentRequest,
  IRequestPaymentResponse,
  IAddManualShippingCostRequest,
  IGetAllTransactionDateRangeResponse,
  IUpdateShippingReceiptRequest,
  IUpdateShippingReceiptResponse,
  IResolveStockIssueRequest,
  IResolveStockIssueResponse,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import {
  UserRepository,
  TransactionItemRepository,
  TransactionRepository,
  CartRepository,
  PPNRepository,
  ProductVariantRepository,
  ShippingRepository,
  CompanyInfoRepository,
} from '../repositories';
import { PaymentUtils, ShippingUtils, TimeUtils } from '../utils';
import { TransactionUtils } from '../utils/transaction-utils';
import { Validator } from '../utils/validator';
import { TransactionValidation } from '../validations';
import { CartService } from './CartService';
import { IoService } from './IoService';
import { Role } from '@prisma/client';
import { EmailUtils } from '../utils';

export class TransactionService {
  static async createTransaction(
    request: ICreateTransactionRequest,
  ): Promise<ICreateTransactionResponse> {
    const validData = Validator.validate(TransactionValidation.CREATE, request);
    const cart = await CartRepository.findByUserId(validData.userId);

    if (!cart?.items.length) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Keranjang tidak boleh kosong',
      );
    }

    const PPNPercentage = await PPNRepository.findCurrentPPN();

    if (!PPNPercentage) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Terjadi Kesalahan',
      );
    }

    const transactionItems: ITransactionItem[] = cart.items.map(item => ({
      variantId: item.variantId!,
      weight_in_kg: item.variant.weight_in_kg,
      packaging: item.variant.packaging?.name,
      productId: item.variant.product.id,
      quantity: item.quantity,
      priceRupiah: item.variant.priceRupiah * item.quantity,
      productName: item.variant.product.name,
    }));

    const totalAmount = transactionItems.reduce(
      (sum, item) => sum + item.priceRupiah,
      0,
    );

    const totalWeightInKg = transactionItems.reduce(
      (sum, item) => sum + item.weight_in_kg * item.quantity,
      0,
    );

    const province = await ShippingRepository.getProvince(validData.province);

    if (!province) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Provinsi tidak valid');
    }

    const city = await ShippingRepository.getCity(province.id, validData.city);

    if (!city) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kota tidak valid');
    }

    const district = await ShippingRepository.getDistrict(
      city.id,
      validData.district,
    );

    if (!district) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kecamatan tidak valid');
    }

    const subdistrict = await ShippingRepository.getSubDistrict(
      district.id,
      validData.subDistrict,
    );

    if (!subdistrict) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kelurahan tidak valid');
    }

    if (validData.postalCode !== subdistrict.zip_code) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Postal code tidak valid',
      );
    }

    const companyInfo = await CompanyInfoRepository.findFirst();

    if (!companyInfo) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Terjadi kesalahan saat membuat transaksi',
      );
    }

    let shippingCost = 0;
    let choosedOption: IShippingOption;

    if (validData.method === TxMethod.DELIVERY) {
      if (!validData.shippingCode || !validData.shippingService) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Shipping code dan shipping service harus diisi',
        );
      }

      const shippingPayload: ICostCheckPayload = {
        origin: companyInfo.subDistrictId.toString(),
        destination: subdistrict.id.toString(),
        weight: totalWeightInKg * 1000,
        courier: 'jne:sicepat:jnt:pos',
      };

      const shippingOptions =
        await ShippingUtils.fetchShippingOptions(shippingPayload);

      choosedOption = shippingOptions.find(
        option =>
          option.code === validData.shippingCode &&
          option.service === validData.shippingService,
      );

      if (!choosedOption) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Opsi pengiriman tidak valid',
        );
      }

      shippingCost = choosedOption.cost;
    }

    const transactionId = `TX-${uuid()}`;
    const PPN = (PPNPercentage.percentage / 100) * totalAmount;
    const grossAmount = totalAmount + PPN + shippingCost;

    const user = await UserRepository.findById(validData.userId);

    if (!user) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Pengguna tidak ditemukan',
      );
    }

    const isDelivery = validData.method === TxMethod.DELIVERY;

    const db = database;

    try {
      const productVariants = await ProductVariantRepository.findAll(db);

      for (const item of cart.items) {
        const productVariant = productVariants.find(
          variant => variant.id === item.variantId,
        );
        if (!productVariant) {
          throw new ResponseError(
            StatusCodes.NOT_FOUND,
            `Variant product ${item.variant.product.name} ${item.variant.packaging.name} ${item.variant.weight_in_kg}kg sudah tidak tersedia`,
          );
        }
        if (productVariant.stock < item.quantity) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            `Stok variant produk ${item.variant.product.name} ${item.variant.packaging.name} ${item.variant.weight_in_kg}kg tidak cukup`,
          );
        }
      }

      const newTransaction = await db.$transaction(async tx => {
        const createdTransaction = await TransactionRepository.create(
          {
            id: transactionId,
            user: { connect: { id: user.id } },
            userName: user.name,
            userEmail: user.email,
            userPhoneNumber: user.phoneNumber,
            cleanPrice: totalAmount,
            priceWithPPN: PPN + totalAmount,
            totalPrice: grossAmount,
            totalWeightInKg: totalWeightInKg,
            PPNPercentage: PPNPercentage.percentage,
            city: city.name,
            province: province.name,
            district: district.name,
            subDistrict: subdistrict.name,
            postalCode: subdistrict.zip_code,
            method: validData.method,
            deliveryStatus: isDelivery ? TxDeliveryStatus.UNPAID : null,
            manualStatus: isDelivery ? null : TxManualStatus.UNPAID,
            shippingAgent: isDelivery ? choosedOption.name : null,
            shippingCode: isDelivery ? choosedOption.code : null,
            shippingService: isDelivery ? choosedOption.service : null,
            shippingEstimate: isDelivery ? choosedOption.etd : null,
            shippingCost: isDelivery ? shippingCost : null,
            shippingAddress: validData.shippingAddress,
            snapUrl: null,
            snapToken: null,
          },
          tx,
        );

        const transactionItemData = transactionItems.map(item => ({
          id: `TI-${uuid()}`,
          transactionId: createdTransaction.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceRupiah: item.priceRupiah,
        }));

        await TransactionItemRepository.createMany(transactionItemData, tx);
        await CartService.clearCart({ userId: validData.userId });

        IoService.emitTransaction();

        return createdTransaction;
      });

      return newTransaction;
    } catch (error) {
      throw error;
    }
  }

  static async requestPayment(
    request: IRequestPaymentRequest,
  ): Promise<IRequestPaymentResponse> {
    const validData = Validator.validate(
      TransactionValidation.REQUEST_PAYMENT,
      request,
    );

    const transaction = await TransactionRepository.findById(
      validData.transactionId,
    );

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (transaction.userId !== validData.userId) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        'Anda tidak memiliki akses untuk melakukan pembayaran ini',
      );
    }

    if (transaction.snapToken && transaction.snapUrl) {
      return { snapUrl: transaction.snapUrl, snapToken: transaction.snapToken };
    }

    const user = await UserRepository.findById(transaction.userId);

    if (!user) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Pengguna tidak ditemukan',
      );
    }

    const transactionItems = transaction.transactionItems.map(item => ({
      variantId: item.variant.id,
      weight_in_kg: item.variant.weight_in_kg,
      packaging: item.variant.packaging?.name,
      productId: item.variant.product.id,
      quantity: item.quantity,
      priceRupiah: item.priceRupiah,
      productName: item.variant.product.name,
    }));

    const PPN = transaction.priceWithPPN - transaction.cleanPrice;
    const grossAmount = transaction.totalPrice;

    const userFirstName = user.name.split(' ')[0];
    const userLastName = user.name.split(' ').slice(1).join(' ') || undefined;
    const customerDetails = {
      first_name: userFirstName,
      last_name: userLastName,
      email: user.email,
      phone: user.phoneNumber,
      address: transaction.shippingAddress,
      shipping_address: {
        first_name: userFirstName,
        last_name: userLastName,
        address: transaction.shippingAddress,
        city: transaction.city,
        phone: user.phoneNumber,
        postal_code: transaction.postalCode,
      },
    };

    const payment = await PaymentUtils.sendToPaymentGateway(
      transaction.id,
      PPN,
      grossAmount,
      transactionItems,
      customerDetails,
      transaction.shippingCost || 0,
    );

    const updatedTransaction = await TransactionRepository.update(
      transaction.id,
      {
        snapUrl: payment.redirect_url,
        snapToken: payment.token,
      },
    );

    return {
      snapUrl: updatedTransaction.snapUrl,
      snapToken: updatedTransaction.snapToken,
    };
  }

  static async transactionNotif(
    request: ITransactionNotifRequest,
  ): Promise<void> {
    const validData = Validator.validate(TransactionValidation.NOTIF, request);

    const transaction = await TransactionRepository.findById(
      validData.transactionId,
    );
    if (transaction) {
      const transactionClearedData: IGetTransactionResponse = {
        id: transaction.id,
        userId: transaction.userId,
        userName: transaction.userName,
        userEmail: transaction.userEmail,
        userPhoneNumber: transaction.userPhoneNumber,
        method: transaction.method,
        deliveryStatus: transaction.deliveryStatus,
        manualStatus: transaction.manualStatus,
        cleanPrice: transaction.cleanPrice,
        priceWithPPN: transaction.priceWithPPN,
        totalPrice: transaction.totalPrice,
        totalWeightInKg: transaction.totalWeightInKg,
        PPNPercentage: transaction.PPNPercentage,
        snapToken: transaction.snapToken,
        snapUrl: transaction.snapUrl,
        city: transaction.city,
        province: transaction.province,
        district: transaction.district,
        subDistrict: transaction.subDistrict,
        postalCode: transaction.postalCode,
        shippingAddress: transaction.shippingAddress,
        shippingCost: transaction.shippingCost,
        shippingAgent: transaction.shippingAgent,
        shippingCode: transaction.shippingCode,
        shippingService: transaction.shippingService,
        shippingEstimate: transaction.shippingEstimate,
        manualShippingCost: transaction.manualShippingCost,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        transactionItems: transaction.transactionItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          priceRupiah: item.priceRupiah,
          isStockIssue: item.isStockIssue,
          variant: {
            id: item.variant.id,
            weight_in_kg: item.variant.weight_in_kg,
            imageUrl: item.variant.imageUrl || null,
            priceRupiah: item.variant.priceRupiah,
            product: {
              id: item.variant.product.id,
              name: item.variant.product.name,
              imageUrl: item.variant.product.imageUrl || null,
            },
            packaging: item.variant.packaging && {
              id: item.variant.packaging.id,
              name: item.variant.packaging.name,
            },
            stock: item.variant.stock,
          },
        })),
      };
      TransactionUtils.actionAfterTransaction(
        transactionClearedData,
        validData,
      );
    }
  }

  static async getById(
    request: IGetTransactionRequest,
  ): Promise<IGetTransactionResponse> {
    const validData = Validator.validate(
      TransactionValidation.GET_BY_ID,
      request,
    );
    const transaction = await TransactionRepository.findById(validData.id);

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (
      transaction.userId !== validData.userId &&
      validData.userRole !== Role.ADMIN
    ) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        'Anda tidak memiliki akses ke transaksi ini',
      );
    }

    return {
      id: transaction.id,
      userId: transaction.userId,
      userName: transaction.userName,
      userEmail: transaction.userEmail,
      userPhoneNumber: transaction.userPhoneNumber,
      method: transaction.method,
      deliveryStatus: transaction.deliveryStatus,
      manualStatus: transaction.manualStatus,
      cleanPrice: transaction.cleanPrice,
      priceWithPPN: transaction.priceWithPPN,
      totalPrice: transaction.totalPrice,
      totalWeightInKg: transaction.totalWeightInKg,
      PPNPercentage: transaction.PPNPercentage,
      snapToken: transaction.snapToken,
      snapUrl: transaction.snapUrl,
      city: transaction.city,
      province: transaction.province,
      district: transaction.district,
      subDistrict: transaction.subDistrict,
      postalCode: transaction.postalCode,
      shippingAddress: transaction.shippingAddress,
      shippingCost: transaction.shippingCost,
      shippingAgent: transaction.shippingAgent,
      shippingCode: transaction.shippingCode,
      shippingService: transaction.shippingService,
      shippingEstimate: transaction.shippingEstimate,
      shippingReceipt: transaction.shippingReceipt,
      manualShippingCost: transaction.manualShippingCost,
      paymentMethod: transaction.paymentMethod,
      isRefundFailed: transaction.isRefundFailed,
      cancelReason: transaction.cancelReason,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      transactionItems: transaction.transactionItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        priceRupiah: item.priceRupiah,
        isStockIssue: item.isStockIssue,
        variant: {
          id: item.variant.id,
          weight_in_kg: item.variant.weight_in_kg,
          imageUrl: item.variant.imageUrl || null,
          priceRupiah: item.variant.priceRupiah,
          product: {
            id: item.variant.product.id,
            name: item.variant.product.name,
            imageUrl: item.variant.product.imageUrl || null,
          },
          packaging: item.variant.packaging && {
            id: item.variant.packaging.id,
            name: item.variant.packaging.name,
          },
          stock: item.variant.stock,
        },
      })),
    };
  }

  static async getAll(
    request: IGetAllTransactionsRequest,
  ): Promise<IGetAllTransactionsResponse> {
    const validData = Validator.validate(
      TransactionValidation.GET_ALL,
      request,
    );

    const page = validData.page;
    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;
    const method = validData.method;
    const status = validData.status;
    const isStockIssue = validData.isStockIssue;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (validData.startYear && validData.startMonth && validData.startDay) {
      startDate = TimeUtils.getStartOfDay(
        validData.startYear,
        validData.startMonth,
        validData.startDay,
      );
    } else if (validData.startYear && validData.startMonth) {
      startDate = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
    }

    if (validData.endYear && validData.endMonth && validData.endDay) {
      endDate = TimeUtils.getEndOfDay(
        validData.endYear,
        validData.endMonth,
        validData.endDay,
      );
    } else if (validData.endYear && validData.endMonth) {
      endDate = TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth);
    }

    if (method && !Object.values(TxMethod).includes(method)) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Metode transaksi tidak valid',
      );
    }

    if (status) {
      if (!method) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Jika Ingin memfilter status, metode transaksi harus ditentukan',
        );
      }
      if (
        method === TxMethod.MANUAL &&
        !Object.values(TxManualStatus).includes(status as TxManualStatus)
      ) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Status tidak valid');
      }
      if (
        method === TxMethod.DELIVERY &&
        !Object.values(TxDeliveryStatus).includes(status as TxDeliveryStatus)
      ) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Status tidak valid');
      }
    }

    // Non-paginated mode
    if (!take || !page) {
      const transactions = await TransactionRepository.findAll(
        method,
        search,
        status,
        startDate,
        endDate,
        isStockIssue,
      );

      return {
        totalPage: 1,
        currentPage: 1,
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          userId: transaction.userId,
          userName: transaction.userName,
          userEmail: transaction.userEmail,
          userPhoneNumber: transaction.userPhoneNumber,
          method: transaction.method,
          deliveryStatus: transaction.deliveryStatus,
          manualStatus: transaction.manualStatus,
          cleanPrice: transaction.cleanPrice,
          priceWithPPN: transaction.priceWithPPN,
          totalPrice: transaction.totalPrice,
          totalWeightInKg: transaction.totalWeightInKg,
          PPNPercentage: transaction.PPNPercentage,
          snapToken: transaction.snapToken,
          snapUrl: transaction.snapUrl,
          city: transaction.city,
          province: transaction.province,
          district: transaction.district,
          subDistrict: transaction.subDistrict,
          postalCode: transaction.postalCode,
          shippingAddress: transaction.shippingAddress,
          shippingCost: transaction.shippingCost,
          shippingAgent: transaction.shippingAgent,
          shippingCode: transaction.shippingCode,
          shippingService: transaction.shippingService,
          shippingEstimate: transaction.shippingEstimate,
          shippingReceipt: transaction.shippingReceipt,
          manualShippingCost: transaction.manualShippingCost,
          paymentMethod: transaction.paymentMethod,
          isRefundFailed: transaction.isRefundFailed,
          cancelReason: transaction.cancelReason,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          transactionItems: transaction.transactionItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceRupiah: item.priceRupiah,
            isStockIssue: item.isStockIssue,
            variant: {
              id: item.variant.id,
              weight_in_kg: item.variant.weight_in_kg,
              imageUrl: item.variant.imageUrl || null,
              priceRupiah: item.variant.priceRupiah,
              product: {
                id: item.variant.product.id,
                name: item.variant.product.name,
                imageUrl: item.variant.product.imageUrl || null,
              },
              packaging: item.variant.packaging && {
                id: item.variant.packaging.id,
                name: item.variant.packaging.name,
              },
              stock: item.variant.stock,
            },
          })),
        })),
      };
    }

    const totalTransactions = await TransactionRepository.count(
      method,
      search,
      status,
      startDate,
      endDate,
      isStockIssue,
    );

    if (totalTransactions === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        transactions: [],
      };
    }

    if (skip >= totalTransactions) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const transactions = await TransactionRepository.findAllWithPagination(
      skip,
      take,
      method,
      search,
      status,
      startDate,
      endDate,
      isStockIssue,
    );

    const totalPage = Math.ceil(totalTransactions / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        userId: transaction.userId,
        userName: transaction.userName,
        userEmail: transaction.userEmail,
        userPhoneNumber: transaction.userPhoneNumber,
        method: transaction.method,
        deliveryStatus: transaction.deliveryStatus,
        manualStatus: transaction.manualStatus,
        cleanPrice: transaction.cleanPrice,
        priceWithPPN: transaction.priceWithPPN,
        totalPrice: transaction.totalPrice,
        totalWeightInKg: transaction.totalWeightInKg,
        PPNPercentage: transaction.PPNPercentage,
        snapToken: transaction.snapToken,
        snapUrl: transaction.snapUrl,
        city: transaction.city,
        province: transaction.province,
        district: transaction.district,
        subDistrict: transaction.subDistrict,
        postalCode: transaction.postalCode,
        shippingAddress: transaction.shippingAddress,
        shippingCost: transaction.shippingCost,
        shippingAgent: transaction.shippingAgent,
        shippingCode: transaction.shippingCode,
        shippingService: transaction.shippingService,
        shippingEstimate: transaction.shippingEstimate,
        shippingReceipt: transaction.shippingReceipt,
        manualShippingCost: transaction.manualShippingCost,
        paymentMethod: transaction.paymentMethod,
        isRefundFailed: transaction.isRefundFailed,
        cancelReason: transaction.cancelReason,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        transactionItems: transaction.transactionItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          priceRupiah: item.priceRupiah,
          isStockIssue: item.isStockIssue,
          variant: {
            id: item.variant.id,
            weight_in_kg: item.variant.weight_in_kg,
            imageUrl: item.variant.imageUrl || null,
            priceRupiah: item.variant.priceRupiah,
            product: {
              id: item.variant.product.id,
              name: item.variant.product.name,
              imageUrl: item.variant.product.imageUrl || null,
            },
            packaging: item.variant.packaging && {
              id: item.variant.packaging.id,
              name: item.variant.packaging.name,
            },
            stock: item.variant.stock,
          },
        })),
      })),
    };
  }

  static async getAllByUserId(
    request: IGetTransactionByUserRequest,
  ): Promise<IGetTransactionByUserResponse> {
    const validData = Validator.validate(
      TransactionValidation.GET_ALL_BY_USER,
      request,
    );

    const isSelf = validData.currentUserId === validData.userId;
    const isAdmin = validData.currentUserRole === Role.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        'Anda tidak memiliki akses untuk melihat transaksi ini',
      );
    }

    const page = validData.page;
    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;
    const method = validData.method;
    const status = validData.status;
    const isStockIssue = validData.isStockIssue;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (validData.startYear && validData.startMonth && validData.startDay) {
      startDate = TimeUtils.getStartOfDay(
        validData.startYear,
        validData.startMonth,
        validData.startDay,
      );
    } else if (validData.startYear && validData.startMonth) {
      startDate = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
    }

    if (validData.endYear && validData.endMonth && validData.endDay) {
      endDate = TimeUtils.getEndOfDay(
        validData.endYear,
        validData.endMonth,
        validData.endDay,
      );
    } else if (validData.endYear && validData.endMonth) {
      endDate = TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth);
    }

    if (!take || !page) {
      const transactions = await TransactionRepository.findByUserId(
        validData.userId,
        method,
        search,
        status,
        startDate,
        endDate,
        isStockIssue,
      );

      return {
        totalPage: 1,
        currentPage: 1,
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          userId: transaction.userId,
          userName: transaction.userName,
          userEmail: transaction.userEmail,
          userPhoneNumber: transaction.userPhoneNumber,
          method: transaction.method,
          deliveryStatus: transaction.deliveryStatus,
          manualStatus: transaction.manualStatus,
          cleanPrice: transaction.cleanPrice,
          priceWithPPN: transaction.priceWithPPN,
          totalPrice: transaction.totalPrice,
          totalWeightInKg: transaction.totalWeightInKg,
          PPNPercentage: transaction.PPNPercentage,
          snapToken: transaction.snapToken,
          snapUrl: transaction.snapUrl,
          city: transaction.city,
          province: transaction.province,
          district: transaction.district,
          subDistrict: transaction.subDistrict,
          postalCode: transaction.postalCode,
          shippingAddress: transaction.shippingAddress,
          shippingCost: transaction.shippingCost,
          shippingAgent: transaction.shippingAgent,
          shippingCode: transaction.shippingCode,
          shippingService: transaction.shippingService,
          shippingEstimate: transaction.shippingEstimate,
          shippingReceipt: transaction.shippingReceipt,
          manualShippingCost: transaction.manualShippingCost,
          paymentMethod: transaction.paymentMethod,
          isRefundFailed: transaction.isRefundFailed,
          cancelReason: transaction.cancelReason,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          transactionItems: transaction.transactionItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceRupiah: item.priceRupiah,
            isStockIssue: item.isStockIssue,
            variant: {
              id: item.variant.id,
              weight_in_kg: item.variant.weight_in_kg,
              imageUrl: item.variant.imageUrl || null,
              priceRupiah: item.variant.priceRupiah,
              product: {
                id: item.variant.product.id,
                name: item.variant.product.name,
                imageUrl: item.variant.product.imageUrl || null,
              },
              packaging: item.variant.packaging && {
                id: item.variant.packaging.id,
                name: item.variant.packaging.name,
              },
              stock: item.variant.stock,
            },
          })),
        })),
      };
    }

    const totalTransactions = await TransactionRepository.countByUserId(
      validData.userId,
      method,
      search,
      status,
      startDate,
      endDate,
      isStockIssue,
    );

    if (totalTransactions === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        transactions: [],
      };
    }

    if (skip >= totalTransactions) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const transactions = await TransactionRepository.findByUserIdWithPagination(
      validData.userId,
      skip,
      take,
      method,
      search,
      status,
      startDate,
      endDate,
      isStockIssue,
    );

    const totalPage = Math.ceil(totalTransactions / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        userId: transaction.userId,
        userName: transaction.userName,
        userEmail: transaction.userEmail,
        userPhoneNumber: transaction.userPhoneNumber,
        method: transaction.method,
        deliveryStatus: transaction.deliveryStatus,
        manualStatus: transaction.manualStatus,
        cleanPrice: transaction.cleanPrice,
        priceWithPPN: transaction.priceWithPPN,
        totalPrice: transaction.totalPrice,
        totalWeightInKg: transaction.totalWeightInKg,
        PPNPercentage: transaction.PPNPercentage,
        snapToken: transaction.snapToken,
        snapUrl: transaction.snapUrl,
        city: transaction.city,
        province: transaction.province,
        district: transaction.district,
        subDistrict: transaction.subDistrict,
        postalCode: transaction.postalCode,
        shippingAddress: transaction.shippingAddress,
        shippingCost: transaction.shippingCost,
        shippingAgent: transaction.shippingAgent,
        shippingCode: transaction.shippingCode,
        shippingService: transaction.shippingService,
        shippingEstimate: transaction.shippingEstimate,
        shippingReceipt: transaction.shippingReceipt,
        manualShippingCost: transaction.manualShippingCost,
        paymentMethod: transaction.paymentMethod,
        isRefundFailed: transaction.isRefundFailed,
        cancelReason: transaction.cancelReason,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        transactionItems: transaction.transactionItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          priceRupiah: item.priceRupiah,
          isStockIssue: item.isStockIssue,
          variant: {
            id: item.variant.id,
            weight_in_kg: item.variant.weight_in_kg,
            imageUrl: item.variant.imageUrl || null,
            priceRupiah: item.variant.priceRupiah,
            product: {
              id: item.variant.product.id,
              name: item.variant.product.name,
              imageUrl: item.variant.product.imageUrl || null,
            },
            packaging: item.variant.packaging && {
              id: item.variant.packaging.id,
              name: item.variant.packaging.name,
            },
            stock: item.variant.stock,
          },
        })),
      })),
    };
  }

  static async updateTransaction(
    request: IUpdateTransactionRequest,
  ): Promise<IUpdateTransactionResponse> {
    const validData = Validator.validate(TransactionValidation.UPDATE, request);

    const transaction = await TransactionRepository.findById(validData.id);
    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    const txMethod = transaction.method;

    if (validData.manualStatus && validData.deliveryStatus) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Hanya satu jenis status yang boleh diubah dalam satu waktu',
      );
    }

    const db = database;

    if (txMethod === TxMethod.DELIVERY) {
      if (!validData.deliveryStatus) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status pengiriman tidak boleh kosong',
        );
      }
      if (validData.manualStatus) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status manual tidak boleh diisi untuk transaksi dengan metode pengiriman',
        );
      }

      const statusOrder = {
        [TxDeliveryStatus.UNPAID]: 0,
        [TxDeliveryStatus.PAID]: 1,
        [TxDeliveryStatus.SHIPPED]: 2,
        [TxDeliveryStatus.DELIVERED]: 3,
        [TxDeliveryStatus.CANCELLED]: 4,
      };

      const current = transaction.deliveryStatus;
      const next = validData.deliveryStatus;

      if (!(next in statusOrder)) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status pengiriman tidak valid',
        );
      }

      if (current === TxDeliveryStatus.CANCELLED) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Transaksi sudah dibatalkan',
        );
      }

      if (statusOrder[next] < statusOrder[current]) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak boleh mundur',
        );
      }

      if (next === current) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak berubah',
        );
      }

      if (
        next !== TxDeliveryStatus.CANCELLED &&
        statusOrder[next] - statusOrder[current] > 1
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak boleh lompat lebih dari satu langkah',
        );
      }

      if (
        current === TxDeliveryStatus.PAID &&
        next !== TxDeliveryStatus.CANCELLED
      ) {
        const hasStockIssue = transaction.transactionItems.some(
          item => item.isStockIssue === true,
        );
        if (hasStockIssue) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Stock issue harus di-resolve terlebih dahulu',
          );
        }
      }

      let updateData: {
        deliveryStatus: TxDeliveryStatus;
        shippingReceipt?: string;
      } = {
        deliveryStatus: next,
      };

      if (next === TxDeliveryStatus.SHIPPED) {
        if (!validData.shippingReceipt) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Nomor resi pengiriman harus diisi',
          );
        }
        updateData = {
          ...updateData,
          shippingReceipt: validData.shippingReceipt,
        };
      }

      if (next === TxDeliveryStatus.PAID) {
        const midtransStatus = await PaymentUtils.checkTransactionStatus(
          validData.id,
        );
        if (
          !['settlement', 'capture'].includes(midtransStatus.transaction_status)
        ) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Status pembayaran belum valid',
          );
        }

        try {
          const updated = await db.$transaction(async tx => {
            const updatedTransaction = await TransactionRepository.update(
              validData.id,
              updateData,
              tx,
            );

            for (const item of updatedTransaction.transactionItems) {
              if (item.variant.stock >= item.quantity) {
                await ProductVariantRepository.update(
                  item.variant.id,
                  {
                    stock: { decrement: item.quantity },
                  },
                  tx,
                );
              } else {
                await TransactionItemRepository.updateById(
                  item.id,
                  {
                    isStockIssue: true,
                  },
                  tx,
                );
              }
            }
            return updatedTransaction;
          });

          IoService.emitTransaction();
          return updated;
        } catch (error) {
          throw error;
        }
      }

      const updated = await TransactionRepository.update(
        validData.id,
        updateData,
      );

      if (next === (TxDeliveryStatus.SHIPPED as TxDeliveryStatus)) {
        EmailUtils.sendShippingNotificationEmail(updated);
      }

      IoService.emitTransaction();
      return updated;
    } else if (txMethod === TxMethod.MANUAL) {
      if (!validData.manualStatus) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status manual tidak boleh kosong',
        );
      }
      if (validData.deliveryStatus) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status pengiriman tidak boleh diisi untuk transaksi manual',
        );
      }

      const statusOrder = {
        [TxManualStatus.UNPAID]: 0,
        [TxManualStatus.PAID]: 1,
        [TxManualStatus.PROCESSING]: 2,
        [TxManualStatus.COMPLETE]: 3,
        [TxManualStatus.CANCELLED]: 4,
      };

      const current = transaction.manualStatus;
      const next = validData.manualStatus;

      if (!(next in statusOrder)) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status manual tidak valid',
        );
      }

      if (current === TxManualStatus.CANCELLED) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Transaksi sudah dibatalkan',
        );
      }

      if (statusOrder[next] < statusOrder[current]) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak boleh mundur',
        );
      }

      if (next === current) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak berubah',
        );
      }

      if (
        next !== TxManualStatus.CANCELLED &&
        statusOrder[next] - statusOrder[current] > 1
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Status tidak boleh lompat lebih dari satu langkah',
        );
      }

      if (
        current === TxManualStatus.PAID &&
        next !== TxManualStatus.CANCELLED
      ) {
        const hasStockIssue = transaction.transactionItems.some(
          item => item.isStockIssue === true,
        );
        if (hasStockIssue) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Stock issue harus di-resolve terlebih dahulu',
          );
        }
      }

      if (next === TxManualStatus.PAID) {
        const midtransStatus = await PaymentUtils.checkTransactionStatus(
          validData.id,
        );
        if (
          !['settlement', 'capture'].includes(midtransStatus.transaction_status)
        ) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Status pembayaran belum valid',
          );
        }

        try {
          const updated = await db.$transaction(async tx => {
            const updatedTransaction = await TransactionRepository.update(
              validData.id,
              {
                manualStatus: next,
              },
              tx,
            );

            for (const item of updatedTransaction.transactionItems) {
              if (item.variant.stock >= item.quantity) {
                await ProductVariantRepository.update(
                  item.variant.id,
                  {
                    stock: { decrement: item.quantity },
                  },
                  tx,
                );
              } else {
                await TransactionItemRepository.updateById(
                  item.id,
                  {
                    isStockIssue: true,
                  },
                  tx,
                );
              }
            }

            return updatedTransaction;
          });

          IoService.emitTransaction();
          return updated;
        } catch (error) {
          throw error;
        }
      }

      const updated = await TransactionRepository.update(validData.id, {
        manualStatus: next,
      });

      IoService.emitTransaction();
      return updated;
    }

    throw new ResponseError(
      StatusCodes.BAD_REQUEST,
      'Metode transaksi tidak dikenali',
    );
  }

  static async updateShippingReceipt(
    request: IUpdateShippingReceiptRequest,
  ): Promise<IUpdateShippingReceiptResponse> {
    const validData = Validator.validate(
      TransactionValidation.UPDATE_SHIPPING_RECEIPT,
      request,
    );

    const transaction = await TransactionRepository.findById(
      validData.transactionId,
    );

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (transaction.method !== TxMethod.DELIVERY) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Metode pengiriman tidak valid',
      );
    }

    if (transaction.deliveryStatus !== TxDeliveryStatus.SHIPPED) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Pengubahan pada nomor resi pengiriman hanya dapat dilakukan pada status pengiriman "SHIPPED"',
      );
    }

    const updated = await TransactionRepository.update(
      validData.transactionId,
      {
        shippingReceipt: validData.shippingReceipt,
      },
    );

    IoService.emitTransaction();
    return updated;
  }

  static async addManualShippingCost(
    request: IAddManualShippingCostRequest,
  ): Promise<IGetTransactionResponse> {
    const validData = Validator.validate(
      TransactionValidation.ADD_MANUAL_SHIPPING_COST,
      request,
    );

    const transaction = await TransactionRepository.findById(
      validData.transactionId,
    );

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (transaction.method !== TxMethod.MANUAL) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Hanya metode manual yang dapat menggunakan biaya pengiriman manual',
      );
    }

    if (
      transaction.manualStatus === TxManualStatus.UNPAID ||
      transaction.manualStatus === TxManualStatus.CANCELLED
    ) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Biaya pengiriman manual tidak dapat ditambahkan pada transaksi yang belum dibayar atau dibatalkan',
      );
    }

    let totalPrice = transaction.totalPrice;

    if (transaction.manualShippingCost) {
      totalPrice -= transaction.manualShippingCost;
    }

    totalPrice += validData.manualShippingCost;
    const db = database;
    const updated = await db.$transaction(async tx => {
      return await TransactionRepository.update(
        validData.transactionId,
        {
          manualShippingCost: validData.manualShippingCost,
          totalPrice: totalPrice,
        },
        tx,
      );
    });

    IoService.emitTransaction();
    return updated;
  }

  static async cancelTransaction(
    request: ICancelTransactionRequest,
  ): Promise<ICancelTransactionResponse> {
    const validData = Validator.validate(TransactionValidation.CANCEL, request);

    const transaction = await TransactionRepository.findById(validData.id);
    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    const txMethod = transaction.method;

    if (
      transaction.userId !== validData.userId &&
      validData.userRole !== Role.ADMIN
    ) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        'Anda tidak memiliki akses untuk membatalkan transaksi ini',
      );
    }

    if (txMethod === TxMethod.DELIVERY) {
      if (
        transaction.deliveryStatus === TxDeliveryStatus.CANCELLED ||
        transaction.deliveryStatus === TxDeliveryStatus.SHIPPED ||
        transaction.deliveryStatus === TxDeliveryStatus.DELIVERED
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Transaksi tidak dapat dibatalkan',
        );
      }
    } else if (txMethod === TxMethod.MANUAL) {
      if (
        transaction.manualStatus === TxManualStatus.PROCESSING ||
        transaction.manualStatus === TxManualStatus.CANCELLED ||
        transaction.manualStatus === TxManualStatus.COMPLETE
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Transaksi tidak dapat dibatalkan',
        );
      }
    } else {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Metode transaksi tidak dikenali',
      );
    }

    const midtransStatus = await PaymentUtils.checkTransactionStatus(
      validData.id,
    );
    const isPaid = ['settlement', 'capture'].includes(
      midtransStatus.transaction_status,
    );

    const db = database;

    try {
      const updatedTransaction = await db.$transaction(async tx => {
        const updatePayload = {
          cancelReason: validData.cancelReason,
          ...(txMethod === TxMethod.DELIVERY
            ? { deliveryStatus: TxDeliveryStatus.CANCELLED }
            : { manualStatus: TxManualStatus.CANCELLED }),
        };

        let cancelledTransaction = await TransactionRepository.update(
          validData.id,
          updatePayload,
          tx,
        );

        if (
          transaction.manualStatus === TxManualStatus.PAID ||
          transaction.deliveryStatus === TxDeliveryStatus.PAID
        ) {
          for (const item of cancelledTransaction.transactionItems) {
            if (!item.isStockIssue) {
              await ProductVariantRepository.update(
                item.variant.id,
                {
                  stock: { increment: item.quantity },
                },
                tx,
              );
            }
          }
        }

        IoService.emitTransaction();

        if (isPaid) {
          const refundResult = await PaymentUtils.refundTransaction(
            validData.id,
            validData.cancelReason,
          );

          if (refundResult.status_code !== '200') {
            cancelledTransaction = await TransactionRepository.update(
              validData.id,
              {
                isRefundFailed: true,
              },
              tx,
            );
          }
        }

        EmailUtils.sendCancellationEmail(cancelledTransaction, {
          cancelledByAdmin: validData.userRole === Role.ADMIN,
        });

        return cancelledTransaction;
      });

      return updatedTransaction;
    } catch (error) {
      throw error;
    }
  }

  static async getTxStatusList(): Promise<IGetTxStatusListResponse> {
    const deliveryStatusList = Object.values(TxDeliveryStatus);
    const manualStatusList = Object.values(TxManualStatus);

    return {
      deliveryStatusList,
      manualStatusList,
    };
  }

  static async getTxMethodList(): Promise<IGetTxMethodListResponse> {
    const txMethodList = Object.values(TxMethod);
    return { txMethodList };
  }

  static async getTransactionDateRanges(): Promise<IGetAllTransactionDateRangeResponse> {
    const [firstTransaction, lastTransaction, monthlyData] = await Promise.all([
      TransactionRepository.findFirstTransactionDate(),
      TransactionRepository.findLastTransactionDate(),
      TransactionRepository.getTransactionMonthsByYear(),
    ]);

    const yearMonthsMap: {
      [year: number]: { months: number[] };
    } = {};

    monthlyData.forEach(({ year, month }) => {
      if (!yearMonthsMap[year]) {
        yearMonthsMap[year] = { months: [] };
      }
      yearMonthsMap[year].months.push(month);
    });

    return {
      firstDate: firstTransaction,
      lastDate: lastTransaction,
      yearMonthsMap,
    };
  }

  static async resolveStockIssueItem(
    request: IResolveStockIssueRequest,
  ): Promise<IResolveStockIssueResponse> {
    const validData = Validator.validate(
      TransactionValidation.RESOLVE_STOCK_ISSUE_ITEM,
      request,
    );

    const item = await TransactionItemRepository.findById(
      validData.transactionItemId,
    );
    if (!item) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Item transaksi tidak ditemukan',
      );
    }

    const transaction = await TransactionRepository.findById(
      item.transactionId,
    );

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (
      transaction.deliveryStatus !== TxDeliveryStatus.PAID &&
      transaction.manualStatus !== TxManualStatus.PAID
    ) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Transaksi tidak dalam status yang valid untuk resolusi masalah stok',
      );
    }

    if (!item.isStockIssue) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Item tidak berstatus stock issue',
      );
    }

    const db = database;
    let updatedItem;
    await db.$transaction(async tx => {
      await ProductVariantRepository.update(
        item.variantId,
        { stock: { increment: validData.stock } },
        tx,
      );
      await ProductVariantRepository.update(
        item.variantId,
        { stock: { decrement: item.quantity } },
        tx,
      );
      updatedItem = await TransactionItemRepository.updateById(
        item.id,
        { isStockIssue: false },
        tx,
      );
    });

    IoService.emitTransaction();
    return updatedItem;
  }
}
