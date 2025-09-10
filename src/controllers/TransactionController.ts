import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import {
  ICreateTransactionRequest,
  ITransactionNotifRequest,
  IRequestPaymentRequest,
  IGetTransactionRequest,
  IGetAllTransactionsRequest,
  IGetTransactionByUserRequest,
  IUpdateTransactionRequest,
  IAddManualShippingCostRequest,
  ICancelTransactionRequest,
  IUpdateShippingReceiptRequest,
  IResolveStockIssueRequest,
} from '../dtos';
import { TransactionService } from '../services';
import { successResponse } from '../utils';
import { TxMethod, TxDeliveryStatus, TxManualStatus } from '@prisma/client';

export class TransactionController {
  static async createTransaction(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: ICreateTransactionRequest = {
        userId: c.get('user').userId,
        city: body.city,
        province: body.province,
        district: body.district,
        subDistrict: body.subDistrict,
        postalCode: body.postalCode,
        shippingAddress: body.shippingAddress,
        shippingCode: body.shippingCode,
        shippingService: body.shippingService,
        method: body.method as TxMethod,
      };
      const response = await TransactionService.createTransaction(request);

      return successResponse(
        c,
        StatusCodes.CREATED,
        'Transaksi berhasil dibuat',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async requestPayment(c: Context): Promise<Response> {
    try {
      const request = {
        transactionId: c.req.param().id,
        userId: c.get('user').userId,
      } as IRequestPaymentRequest;

      const response = await TransactionService.requestPayment(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Permintaan pembayaran berhasil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async transactionNotif(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request = {
        transactionId: body.order_id,
        transactionStatus: body.transaction_status,
        fraudStatus: body.fraud_status,
        statusCode: body.status_code,
        grossAmount: body.gross_amount,
        paymentType: body.payment_type,
        signatureKey: body.signature_key,
      } as ITransactionNotifRequest;

      await TransactionService.transactionNotif(request);

      return successResponse(
        c,
        StatusCodes.OK,
        'Transaction notification received successfully',
      );
    } catch (error) {
      throw error;
    }
  }

  static async getById(c: Context): Promise<Response> {
    try {
      const request: IGetTransactionRequest = {
        id: c.req.param().id,
        userId: c.get('user').userId,
        userRole: c.get('user').role,
      };

      const response = await TransactionService.getById(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Detail transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getAll(c: Context): Promise<Response> {
    try {
      let isStockIssue: boolean | undefined = undefined;
      if (typeof c.req.query().isStockIssue !== 'undefined') {
        const v = String(c.req.query().isStockIssue).toLowerCase();
        if (v === 'true') isStockIssue = true;
        else if (v === 'false') isStockIssue = false;
        else isStockIssue = undefined;
      }

      const request: IGetAllTransactionsRequest = {
        method: c.req.query().method as TxMethod,
        search: c.req.query().search as string,
        status: c.req.query().status as TxDeliveryStatus | TxManualStatus,
        page: c.req.query().page
          ? parseInt(c.req.query().page as string, 10)
          : 1,
        limit: c.req.query().limit
          ? parseInt(c.req.query().limit as string, 10)
          : 10,
        isStockIssue,
        startYear: c.req.query().startYear
          ? parseInt(c.req.query().startYear as string, 10)
          : undefined,
        startMonth: c.req.query().startMonth
          ? parseInt(c.req.query().startMonth as string, 10)
          : undefined,
        startDay: c.req.query().startDay
          ? parseInt(c.req.query().startDay as string, 10)
          : undefined,
        endYear: c.req.query().endYear
          ? parseInt(c.req.query().endYear as string, 10)
          : undefined,
        endMonth: c.req.query().endMonth
          ? parseInt(c.req.query().endMonth as string, 10)
          : undefined,
        endDay: c.req.query().endDay
          ? parseInt(c.req.query().endDay as string, 10)
          : undefined,
      };

      const response = await TransactionService.getAll(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(c: Context): Promise<Response> {
    try {
      let isStockIssue: boolean | undefined = undefined;
      if (typeof c.req.query().isStockIssue !== 'undefined') {
        const v = String(c.req.query().isStockIssue).toLowerCase();
        if (v === 'true') isStockIssue = true;
        else if (v === 'false') isStockIssue = false;
        else isStockIssue = undefined;
      }

      const request: IGetTransactionByUserRequest = {
        userId: c.req.param().userId,
        currentUserId: c.get('user').userId,
        currentUserRole: c.get('user').role,
        method: c.req.query().method as TxMethod,
        status: c.req.query().status as TxDeliveryStatus | TxManualStatus,
        page: c.req.query().page
          ? parseInt(c.req.query().page as string, 10)
          : 1,
        limit: c.req.query().limit
          ? parseInt(c.req.query().limit as string, 10)
          : 10,
        search: c.req.query().search as string,
        isStockIssue,
        startYear: c.req.query().startYear
          ? parseInt(c.req.query().startYear as string, 10)
          : undefined,
        startMonth: c.req.query().startMonth
          ? parseInt(c.req.query().startMonth as string, 10)
          : undefined,
        startDay: c.req.query().startDay
          ? parseInt(c.req.query().startDay as string, 10)
          : undefined,
        endYear: c.req.query().endYear
          ? parseInt(c.req.query().endYear as string, 10)
          : undefined,
        endMonth: c.req.query().endMonth
          ? parseInt(c.req.query().endMonth as string, 10)
          : undefined,
        endDay: c.req.query().endDay
          ? parseInt(c.req.query().endDay as string, 10)
          : undefined,
      };

      const response = await TransactionService.getAllByUserId(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateTransactionStatus(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: IUpdateTransactionRequest = {
        id: c.req.param().id,
        deliveryStatus:
          body.deliveryStatus !== undefined
            ? (body.deliveryStatus as TxDeliveryStatus)
            : undefined,
        manualStatus:
          body.manualStatus !== undefined
            ? (body.manualStatus as TxManualStatus)
            : undefined,
        shippingReceipt:
          body.shippingReceipt !== undefined ? body.shippingReceipt : undefined,
      };

      const response = await TransactionService.updateTransaction(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Status transaksi berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateShippingReceipt(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: IUpdateShippingReceiptRequest = {
        transactionId: c.req.param().id,
        shippingReceipt: body.shippingReceipt,
      };

      const response = await TransactionService.updateShippingReceipt(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Nomor resi pengiriman berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async addManualShippingCost(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: IAddManualShippingCostRequest = {
        transactionId: c.req.param().id,
        manualShippingCost: body.manualShippingCost,
      };

      const response = await TransactionService.addManualShippingCost(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Biaya pengiriman manual berhasil ditambahkan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async cancelTransaction(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: ICancelTransactionRequest = {
        id: c.req.param().id,
        userId: c.get('user').userId,
        cancelReason: body.cancelReason,
        userRole: c.get('user').role,
      };

      const response = await TransactionService.cancelTransaction(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Transaksi berhasil dibatalkan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async resolveStockIssue(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: IResolveStockIssueRequest = {
        transactionItemId: c.req.param().transactionItemId,
        stock: body.stock,
      };

      const response = await TransactionService.resolveStockIssueItem(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Percobaan resolve stock issue selesai',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTxStatusList(c: Context): Promise<Response> {
    try {
      const response = await TransactionService.getTxStatusList();
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar status transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTxMethodList(c: Context): Promise<Response> {
    try {
      const response = await TransactionService.getTxMethodList();
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar metode transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionDateRanges(c: Context): Promise<Response> {
    try {
      const response = await TransactionService.getTransactionDateRanges();
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar rentang tanggal transaksi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }
}
