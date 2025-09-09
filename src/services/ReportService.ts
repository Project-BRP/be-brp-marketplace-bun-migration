import { ReportValidation } from '../validations';
import type {
  IGetRevenueRequest,
  IGetRevenueResponse,
  IGetTotalTransactionsRequest,
  IGetTotalTransactionsResponse,
  IGetTodayTotalTransactionsResponse,
  IGetCurrentMonthRevenueResponse,
  IGetTotalProductsResponse,
  IGetTotalProductsSoldRequest,
  IGetTotalProductsSoldResponse,
  IGetTotalActiveUsersRequest,
  IGetTotalActiveUsersResponse,
  IGetMonthlyRevenueRequest,
  IGetMonthlyRevenueResponse,
  IGetMostSoldProductsDistributionRequest,
  IGetMostSoldProductsDistributionResponse,
  IExportDataRequest,
} from '../dtos';
import {
  TransactionRepository,
  UserRepository,
  ProductRepository,
  TransactionItemRepository,
  PackagingRepository,
  ProductTypeRepository,
  ProductVariantRepository,
} from '../repositories';
import { CsvUtils, TimeUtils, Validator } from '../utils';
import { db } from '../configs/database';

export class ReportService {
  static async exportData(request: IExportDataRequest) {
    const validData = Validator.validate(ReportValidation.EXPORT_DATA, request);

    const tables = validData.tables?.length
      ? validData.tables
      : ([
          'users',
          'products',
          'product_variants',
          'product_types',
          'packagings',
          'transactions',
          'transaction_items',
        ] as const);

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (
      validData.startYear !== undefined &&
      validData.startMonth !== undefined &&
      validData.startDay !== undefined
    ) {
      startDate = TimeUtils.getStartOfDay(
        validData.startYear,
        validData.startMonth,
        validData.startDay,
      );
    } else if (
      validData.startYear !== undefined &&
      validData.startMonth !== undefined
    ) {
      startDate = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
    }
    if (
      validData.endYear !== undefined &&
      validData.endMonth !== undefined &&
      validData.endDay !== undefined
    ) {
      endDate = TimeUtils.getEndOfDay(
        validData.endYear,
        validData.endMonth,
        validData.endDay,
      );
    } else if (
      validData.endYear !== undefined &&
      validData.endMonth !== undefined
    ) {
      endDate = TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth);
    }

    const files: { name: string; content: string }[] = [];

    if (tables.includes('users')) {
      const rows = await UserRepository.findAll();
      const userRows = rows.map(
        ({ _count, transaction, password, ...rest }) => rest,
      );
      files.push({ name: 'users.csv', content: CsvUtils.toCsv(userRows) });
    }
    if (tables.includes('products')) {
      const rows = await ProductRepository.findAll();
      const productRows = rows.map(
        ({ productType, productVariants, ...rest }) => rest,
      );
      files.push({
        name: 'products.csv',
        content: CsvUtils.toCsv(productRows),
      });
    }
    if (tables.includes('product_variants')) {
      const rows = await ProductVariantRepository.findAll();
      const productVariantRows = rows.map(({ packaging, ...rest }) => rest);
      files.push({
        name: 'product_variants.csv',
        content: CsvUtils.toCsv(productVariantRows),
      });
    }
    if (tables.includes('product_types')) {
      const rows = await ProductTypeRepository.findAll();
      files.push({ name: 'product_types.csv', content: CsvUtils.toCsv(rows) });
    }
    if (tables.includes('packagings')) {
      const rows = await PackagingRepository.findAll();
      files.push({ name: 'packagings.csv', content: CsvUtils.toCsv(rows) });
    }
    if (tables.includes('transactions')) {
      const rows = await TransactionRepository.findAll(
        undefined,
        undefined,
        undefined,
        startDate,
        endDate,
      );
      const transactionRows = rows.map(({ transactionItems, ...rest }) => rest);
      files.push({
        name: 'transactions.csv',
        content: CsvUtils.toCsv(transactionRows),
      });

      if (tables.includes('transaction_items')) {
        let items = [];
        for (const tx of rows) {
          for (const item of tx.transactionItems) {
            items.push(item);
          }
        }
        const itemRows = items.map(({ variant, ...rest }) => rest);
        files.push({
          name: 'transaction_items.csv',
          content: CsvUtils.toCsv(itemRows),
        });
      }
    }
    if (
      tables.includes('transaction_items') &&
      !tables.includes('transactions')
    ) {
      const rows = await TransactionItemRepository.findManyCustom({
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      });
      files.push({
        name: 'transaction_items.csv',
        content: CsvUtils.toCsv(rows),
      });
    }

    return files;
  }
  static async getRevenue(
    request: IGetRevenueRequest,
  ): Promise<IGetRevenueResponse> {
    const validData = Validator.validate(ReportValidation.GET_REVENUE, request);

    const now = TimeUtils.now();

    const firstTransactionDate =
      await TransactionRepository.findFirstTransactionDate();
    const cumulativeStartDate =
      validData.startYear && validData.startMonth
        ? TimeUtils.getStartOfMonth(validData.startYear, validData.startMonth)
        : firstTransactionDate ||
          TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);

    const cumulativeEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : now;

    const totalRevenue =
      await TransactionRepository.aggregateRevenueByDateRange(
        cumulativeStartDate,
        cumulativeEndDate,
      );

    let gainPercentage = 0;

    const currentMonthStartDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getStartOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);
    const currentMonthEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getEndOfMonth(now.getFullYear(), now.getMonth() + 1);

    const prevMonth =
      validData.endYear && validData.endMonth
        ? new Date(validData.endYear, validData.endMonth - 1)
        : new Date(now.getFullYear(), now.getMonth());
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStartDate = TimeUtils.getStartOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );
    const prevMonthEndDate = TimeUtils.getEndOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );

    const currentMonthRevenue =
      await TransactionRepository.aggregateRevenueByDateRange(
        currentMonthStartDate,
        currentMonthEndDate,
      );
    const previousMonthRevenue =
      await TransactionRepository.aggregateRevenueByDateRange(
        prevMonthStartDate,
        prevMonthEndDate,
      );

    gainPercentage =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : currentMonthRevenue > 0
          ? 100
          : 0;

    return {
      totalRevenue,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
    };
  }

  static async getCurrentMonthRevenue(): Promise<IGetCurrentMonthRevenueResponse> {
    const now = TimeUtils.now();

    const currentMonthStartDate = TimeUtils.getStartOfMonth(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    const currentMonthEndDate = TimeUtils.getEndOfMonth(
      now.getFullYear(),
      now.getMonth() + 1,
    );

    const totalRevenue =
      await TransactionRepository.aggregateRevenueByDateRange(
        currentMonthStartDate,
        currentMonthEndDate,
      );

    let gainPercentage = 0;

    const previousMonth = new Date(now);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const prevMonthStartDate = TimeUtils.getStartOfMonth(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1,
    );
    const prevMonthEndDate = TimeUtils.getEndOfMonth(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1,
    );

    const previousMonthRevenue =
      await TransactionRepository.aggregateRevenueByDateRange(
        prevMonthStartDate,
        prevMonthEndDate,
      );

    gainPercentage =
      previousMonthRevenue > 0
        ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : totalRevenue > 0
          ? 100
          : 0;

    return {
      totalRevenue,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
    };
  }

  static async getTotalTransactions(
    request: IGetTotalTransactionsRequest,
  ): Promise<IGetTotalTransactionsResponse> {
    const validData = Validator.validate(
      ReportValidation.GET_TOTAL_TRANSACTIONS,
      request,
    );

    const now = TimeUtils.now();

    const firstTransactionDate =
      await TransactionRepository.findFirstTransactionDate();
    const cumulativeStartDate =
      validData.startYear && validData.startMonth
        ? TimeUtils.getStartOfMonth(validData.startYear, validData.startMonth)
        : firstTransactionDate ||
          TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);
    const cumulativeEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : now;

    const totalTransactions =
      await TransactionRepository.countCompletedTransactions(
        cumulativeStartDate,
        cumulativeEndDate,
      );

    let gainPercentage = 0;

    const currentMonthStartDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getStartOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);
    const currentMonthEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getEndOfMonth(now.getFullYear(), now.getMonth() + 1);

    const prevMonth =
      validData.endYear && validData.endMonth
        ? new Date(validData.endYear, validData.endMonth - 1)
        : new Date(now.getFullYear(), now.getMonth());
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStartDate = TimeUtils.getStartOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );
    const prevMonthEndDate = TimeUtils.getEndOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );

    const currentMonthTransactions =
      await TransactionRepository.countCompletedTransactions(
        currentMonthStartDate,
        currentMonthEndDate,
      );
    const previousMonthTransactions =
      await TransactionRepository.countCompletedTransactions(
        prevMonthStartDate,
        prevMonthEndDate,
      );

    gainPercentage =
      previousMonthTransactions > 0
        ? ((currentMonthTransactions - previousMonthTransactions) /
            previousMonthTransactions) *
          100
        : currentMonthTransactions > 0
          ? 100
          : 0;

    return {
      totalTransactions,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
    };
  }

  static async getTodayTotalTransactions(): Promise<IGetTodayTotalTransactionsResponse> {
    const now = TimeUtils.now();

    const todayStartDate = TimeUtils.getStartOfDay(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );
    const todayEndDate = TimeUtils.getEndOfDay(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );

    const totalTransactions =
      await TransactionRepository.countNotUnpaidAndNotCancelled(
        undefined,
        undefined,
        undefined,
        todayStartDate,
        todayEndDate,
      );

    let gainPercentage = 0;

    const previousDay = new Date(now);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevDayStartDate = TimeUtils.getStartOfDay(
      previousDay.getFullYear(),
      previousDay.getMonth() + 1,
      previousDay.getDate(),
    );
    const prevDayEndDate = TimeUtils.getEndOfDay(
      previousDay.getFullYear(),
      previousDay.getMonth() + 1,
      previousDay.getDate(),
    );

    const previousDayTransactions =
      await TransactionRepository.countNotUnpaidAndNotCancelled(
        undefined,
        undefined,
        undefined,
        prevDayStartDate,
        prevDayEndDate,
      );

    gainPercentage =
      previousDayTransactions > 0
        ? ((totalTransactions - previousDayTransactions) /
            previousDayTransactions) *
          100
        : totalTransactions > 0
          ? 100
          : 0;

    return {
      totalTransactions,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
    };
  }

  static async getTotalProductsSold(
    request: IGetTotalProductsSoldRequest,
  ): Promise<IGetTotalProductsSoldResponse> {
    const validData = Validator.validate(
      ReportValidation.GET_TOTAL_PRODUCTS_SOLD,
      request,
    );

    const now = TimeUtils.now();

    const firstTransactionDate =
      await TransactionRepository.findFirstTransactionDate();
    const cumulativeStartDate =
      validData.startYear && validData.startMonth
        ? TimeUtils.getStartOfMonth(validData.startYear, validData.startMonth)
        : firstTransactionDate ||
          TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);

    const cumulativeEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : now;

    const totalProductsSold =
      await TransactionRepository.countTotalProductsSold(
        cumulativeStartDate,
        cumulativeEndDate,
      );

    let gainPercentage = 0;

    let currentMonthStartDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getStartOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);
    currentMonthStartDate.setDate(currentMonthStartDate.getDate() - 30);
    const currentMonthEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getEndOfMonth(now.getFullYear(), now.getMonth() + 1);

    const prevMonth =
      validData.endYear && validData.endMonth
        ? new Date(validData.endYear, validData.endMonth - 1)
        : new Date(now.getFullYear(), now.getMonth());
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    let prevMonthStartDate = TimeUtils.getStartOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );
    prevMonthStartDate.setDate(prevMonthStartDate.getDate() - 30);
    const prevMonthEndDate = TimeUtils.getEndOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );

    const currentMonthProductsSold =
      await TransactionRepository.countTotalProductsSold(
        currentMonthStartDate,
        currentMonthEndDate,
      );
    const previousMonthProductsSold =
      await TransactionRepository.countTotalProductsSold(
        prevMonthStartDate,
        prevMonthEndDate,
      );

    gainPercentage =
      previousMonthProductsSold > 0
        ? ((currentMonthProductsSold - previousMonthProductsSold) /
            previousMonthProductsSold) *
          100
        : currentMonthProductsSold > 0
          ? 100
          : 0;

    return {
      totalProductsSold,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
    };
  }

  static async getTotalActiveUsers(
    request: IGetTotalActiveUsersRequest,
  ): Promise<IGetTotalActiveUsersResponse> {
    const validData = Validator.validate(
      ReportValidation.GET_TOTAL_ACTIVE_USERS,
      request,
    );

    const now = TimeUtils.now();

    const cumulativeEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : now;

    // Tentukan cumulativeStartDate
    let cumulativeStartDate: Date;
    if (validData.startYear && validData.startMonth) {
      const inputStart = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
      cumulativeStartDate = new Date(inputStart);
      cumulativeStartDate.setDate(cumulativeStartDate.getDate() - 30);
    } else {
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 30);
      cumulativeStartDate = defaultStart;
    }

    const totalActiveUsers = await UserRepository.countActiveUsers(
      cumulativeStartDate,
      cumulativeEndDate,
    );

    // === Perhitungan Gain Percentage ===
    let gainPercentage = 0;

    // Current Month (mundur 30 hari)
    const currentMonthStartRaw =
      validData.endYear && validData.endMonth
        ? TimeUtils.getStartOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getStartOfMonth(now.getFullYear(), now.getMonth() + 1);
    currentMonthStartRaw.setDate(currentMonthStartRaw.getDate() - 30);
    const currentMonthStartDate = currentMonthStartRaw;

    const currentMonthEndDate =
      validData.endYear && validData.endMonth
        ? TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth)
        : TimeUtils.getEndOfMonth(now.getFullYear(), now.getMonth() + 1);

    // Previous Month (mundur 30 hari)
    const prevMonth =
      validData.endYear && validData.endMonth
        ? new Date(validData.endYear, validData.endMonth - 1)
        : new Date(now.getFullYear(), now.getMonth());
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    let prevMonthStartDate: Date;
    prevMonthStartDate = new Date(prevMonth);
    prevMonthStartDate.setDate(prevMonthStartDate.getDate() - 30);

    const prevMonthEndDate = TimeUtils.getEndOfMonth(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
    );

    const currentMonthActiveUsers = await UserRepository.countActiveUsers(
      currentMonthStartDate,
      currentMonthEndDate,
    );

    const previousMonthActiveUsers = await UserRepository.countActiveUsers(
      prevMonthStartDate,
      prevMonthEndDate,
    );

    gainPercentage =
      previousMonthActiveUsers > 0
        ? ((currentMonthActiveUsers - previousMonthActiveUsers) /
            previousMonthActiveUsers) *
          100
        : currentMonthActiveUsers > 0
          ? 100
          : 0;

    const gain = currentMonthActiveUsers - previousMonthActiveUsers;

    return {
      totalActiveUsers,
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
      gain,
    };
  }

  static async getMonthlyRevenue(
    request: IGetMonthlyRevenueRequest,
  ): Promise<IGetMonthlyRevenueResponse> {
    const validData = Validator.validate(
      ReportValidation.GET_MONTHLY_REVENUE,
      request,
    );

    let startDate: Date;
    let endDate: Date;

    // Logika utama tetap jelas terbaca di service
    if (
      validData.startYear &&
      validData.startMonth &&
      validData.endYear &&
      validData.endMonth
    ) {
      // Kasus 1: User memberikan filter rentang tanggal
      startDate = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
      endDate = TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth);
    } else {
      // Kasus 2: User tidak memberikan filter, gunakan default (12 bulan terakhir)
      const now = TimeUtils.now();
      endDate = TimeUtils.getEndOfMonth(now.getFullYear(), now.getMonth() + 1);

      const defaultStartDate = new Date(now);
      defaultStartDate.setFullYear(now.getFullYear() - 1);
      startDate = TimeUtils.getStartOfMonth(
        defaultStartDate.getFullYear(),
        defaultStartDate.getMonth() + 1,
      );
    }

    const monthlyData = await TransactionRepository.getMonthlyRevenue(
      startDate,
      endDate,
    );

    const revenues = monthlyData.map((currentMonth, index) => {
      const lastMonthRevenue =
        index > 0 ? monthlyData[index - 1].total_revenue : 0;
      let gainPercentage = 0;
      if (lastMonthRevenue > 0) {
        gainPercentage =
          ((currentMonth.total_revenue - lastMonthRevenue) / lastMonthRevenue) *
          100;
      } else if (currentMonth.total_revenue > 0) {
        gainPercentage = 100;
      }
      return {
        year: currentMonth.year,
        month: currentMonth.month,
        totalRevenue: currentMonth.total_revenue,
        gainPercentage: parseFloat(gainPercentage.toFixed(2)),
      };
    });

    return { revenues };
  }

  static async getMostSoldProductsDistribution(
    request: IGetMostSoldProductsDistributionRequest,
  ): Promise<IGetMostSoldProductsDistributionResponse> {
    const validData = Validator.validate(
      ReportValidation.GET_MOST_SOLD_PRODUCTS_DISTRIBUTION,
      request,
    );

    let startDate: Date;
    let endDate: Date;

    // Logika utama untuk menentukan rentang tanggal
    if (
      validData.startYear &&
      validData.startMonth &&
      validData.endYear &&
      validData.endMonth
    ) {
      // Kasus 1: User memberikan filter rentang tanggal
      startDate = TimeUtils.getStartOfMonth(
        validData.startYear,
        validData.startMonth,
      );
      endDate = TimeUtils.getEndOfMonth(validData.endYear, validData.endMonth);
    } else {
      // Kasus 2: User tidak memberikan filter, gunakan default baru
      endDate = TimeUtils.now(); // Default endDate adalah hari ini

      const firstTransactionDate =
        await TransactionRepository.findFirstTransactionDate();

      // Jika ada transaksi, startDate adalah tanggal transaksi pertama.
      // Jika tidak, startDate adalah awal bulan ini.
      startDate =
        firstTransactionDate ||
        TimeUtils.getStartOfMonth(
          endDate.getFullYear(),
          endDate.getMonth() + 1,
        );
    }

    const soldProducts = await TransactionRepository.getMostSoldProducts(
      startDate,
      endDate,
    );

    return {
      products: soldProducts.map(p => ({
        id: p.id,
        name: p.name,
        totalSold: p.total_sold,
        currentMonthSold: p.current_month_sold,
      })),
    };
  }

  static async getTotalProducts(): Promise<IGetTotalProductsResponse> {
    const totalProducts = await ProductRepository.count();
    return { totalProducts };
  }
}
