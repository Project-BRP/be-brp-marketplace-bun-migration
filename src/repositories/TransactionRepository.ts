import {
  Prisma,
  TxDeliveryStatus,
  TxManualStatus,
  TxMethod,
} from '@prisma/client';
import { db } from '../configs/database';
import { TimeUtils } from '../utils';

export class TransactionRepository {
  static async create(
    data: Prisma.TransactionCreateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transaction.create({
      data: data,
    });
  }

  static async update(
    id: string,
    data: Prisma.TransactionUpdateInput,
    tx: Prisma.TransactionClient = db,
  ) {
    return tx.transaction.update({
      where: { id },
      data: data,
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
    });
  }

  static async findById(id: string, tx: Prisma.TransactionClient = db) {
    return tx.transaction.findUnique({
      where: { id },
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
    });
  }

  static async findAll(
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = {};

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.findMany({
      where: {
        ...whereCondition,
      },
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findAllWithPagination(
    skip: number,
    take: number,
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = {};

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.findMany({
      skip: skip,
      take: take,
      where: {
        ...whereCondition,
      },
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async count(
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = {};

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.count({
      where: {
        ...whereCondition,
      },
    });
  }

  static async countNotUnpaidAndNotCancelled(
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = {};

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return tx.transaction.count({
      where: {
        ...whereCondition,
        OR: [
          {
            method: TxMethod.DELIVERY,
            deliveryStatus: {
              notIn: [TxDeliveryStatus.UNPAID, TxDeliveryStatus.CANCELLED],
            },
          },
          {
            method: TxMethod.MANUAL,
            manualStatus: {
              notIn: [TxManualStatus.UNPAID, TxManualStatus.CANCELLED],
            },
          },
        ],
      },
    });
  }

  static async findByUserId(
    userId: string,
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = { userId };

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.findMany({
      where: { ...whereCondition },
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findByUserIdWithPagination(
    userId: string,
    skip: number,
    take: number,
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = { userId };

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.findMany({
      where: { ...whereCondition },
      skip: skip,
      take: take,
      include: {
        transactionItems: {
          include: {
            variant: {
              include: {
                product: true,
                packaging: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async countByUserId(
    userId: string,
    method?: TxMethod,
    search?: string,
    status?: TxDeliveryStatus | TxManualStatus,
    startDate?: Date,
    endDate?: Date,
    isStockIssue?: boolean,
    tx: Prisma.TransactionClient = db,
  ) {
    const whereCondition: Prisma.TransactionWhereInput = { userId };

    if (method) {
      whereCondition.method = method;
      if (method === TxMethod.DELIVERY) {
        whereCondition.deliveryStatus = status as TxDeliveryStatus;
      } else if (method === TxMethod.MANUAL) {
        whereCondition.manualStatus = status as TxManualStatus;
      }
    }

    if (search) {
      whereCondition.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;
      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    if (isStockIssue !== undefined) {
      whereCondition.transactionItems = isStockIssue
        ? { some: { isStockIssue: true } }
        : { none: { isStockIssue: true } };
    }

    return tx.transaction.count({
      where: { ...whereCondition },
    });
  }

  // Di dalam TransactionRepository.ts

  static async aggregateRevenueByDateRange(
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient = db,
  ) {
    // Anda bisa menghapus SET TIME ZONE di sini jika sudah ada di query raw,
    // tapi lebih aman jika dibiarkan untuk konsistensi.

    const delivered = TxDeliveryStatus.DELIVERED.toString();
    const complete = TxManualStatus.COMPLETE.toString();

    // Ganti total implementasi dengan query raw yang sudah terbukti benar.
    const result: { total_revenue: bigint | null }[] = await tx.$queryRaw`
    SELECT
      SUM("clean_price" + COALESCE("shipping_cost", 0) + COALESCE("manual_extra_cost", 0))::bigint AS total_revenue
    FROM
      transactions
    WHERE
      ("delivery_status"::text = ${delivered} OR "manual_status"::text = ${complete})
      AND "created_at" >= ${startDate}
      AND "created_at" <= ${endDate};
  `;

    const totalRevenue = result[0]?.total_revenue;
    return Number(totalRevenue || 0);
  }

  static async countCompletedTransactions(
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient = db,
  ): Promise<number> {
    const delivered = TxDeliveryStatus.DELIVERED.toString();
    const complete = TxManualStatus.COMPLETE.toString();

    const result: { total_completed: bigint | null }[] = await tx.$queryRaw`
      SELECT
        COUNT(*)::bigint AS total_completed
      FROM
        transactions
      WHERE
        ("delivery_status"::text = ${delivered} OR "manual_status"::text = ${complete})
        AND "created_at" >= ${startDate}
        AND "created_at" <= ${endDate};
    `;

    return Number(result[0]?.total_completed || 0);
  }

  static async countTotalProductsSold(
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient = db,
  ): Promise<number> {
    // 1. Pastikan konsistensi timezone

    const delivered = TxDeliveryStatus.DELIVERED.toString();
    const complete = TxManualStatus.COMPLETE.toString();

    // 2. Gunakan raw query untuk menggabungkan tabel dan menyaring data
    const result: { total_sold: bigint | null }[] = await tx.$queryRaw`
    SELECT
      SUM(ti.quantity)::bigint AS total_sold
    FROM
      transaction_items AS ti
    JOIN
      transactions AS t ON ti."transaction_id" = t.id
    WHERE
      (t."delivery_status"::text = ${delivered} OR t."manual_status"::text = ${complete})
      AND t."created_at" >= ${startDate}
      AND t."created_at" <= ${endDate};
  `;

    // 3. Proses hasilnya
    const totalSold = result[0]?.total_sold;
    return Number(totalSold || 0);
  }

  static async getMonthlyRevenue(
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient = db,
  ) {
    const delivered = TxDeliveryStatus.DELIVERED.toString();
    const complete = TxManualStatus.COMPLETE.toString();

    const result: { year: number; month: number; total_revenue: bigint }[] =
      await tx.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM "created_at")::integer AS year,
      EXTRACT(MONTH FROM "created_at")::integer AS month,
      SUM("clean_price" + COALESCE("shipping_cost", 0) + COALESCE("manual_extra_cost", 0))::bigint AS total_revenue
    FROM
      transactions
    WHERE
      ("delivery_status"::text = ${delivered} OR "manual_status"::text = ${complete})
      AND "created_at" >= ${startDate}
      AND "created_at" <= ${endDate}
    GROUP BY
      year, month
    ORDER BY
      year ASC, month ASC;
  `;

    return result.map(row => ({
      ...row,
      total_revenue: Number(row.total_revenue),
    }));
  }

  static async getMostSoldProducts(
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient = db,
  ) {
    const delivered = TxDeliveryStatus.DELIVERED.toString();
    const complete = TxManualStatus.COMPLETE.toString();

    const now = TimeUtils.now();
    const currentMonthStart = TimeUtils.getStartOfMonth(
      now.getFullYear(),
      now.getMonth() + 1,
    );
    const currentMonthEnd = TimeUtils.getEndOfMonth(
      now.getFullYear(),
      now.getMonth() + 1,
    );

    const result: {
      id: string;
      name: string;
      total_sold: bigint;
      current_month_sold: bigint;
    }[] = await tx.$queryRaw`
      SELECT
        p.id,
        p.name,
        SUM(ti.quantity)::bigint AS total_sold,
        SUM(
          CASE
            WHEN t."created_at" >= ${currentMonthStart} AND t."created_at" <= ${currentMonthEnd}
            THEN ti.quantity
            ELSE 0
          END
        )::bigint AS current_month_sold
      FROM
        transaction_items AS ti
      JOIN
        transactions AS t ON ti."transaction_id" = t.id
      JOIN
        product_variants AS pv ON ti."variant_id" = pv.id
      JOIN
        products AS p ON pv."product_id" = p.id
      WHERE
        (t."delivery_status"::text = ${delivered} OR t."manual_status"::text = ${complete})
        AND t."created_at" >= ${startDate}
        AND t."created_at" <= ${endDate}
      GROUP BY
        p.id, p.name
      ORDER BY
        total_sold DESC
      LIMIT 10;
    `;

    return result.map(row => ({
      ...row,
      total_sold: Number(row.total_sold),
      current_month_sold: Number(row.current_month_sold),
    }));
  }

  static async findFirstTransactionDate(
    tx: Prisma.TransactionClient = db,
  ): Promise<Date | null> {
    const firstTransaction: { createdAt: Date | null }[] = await tx.$queryRaw`
    SELECT
      MIN("created_at") AS "createdAt"
    FROM
      transactions;
  `;

    return firstTransaction[0]?.createdAt || null;
  }

  // ... (tambahkan method baru ini di dalam class TransactionRepository)

  static async findLastTransactionDate(
    tx: Prisma.TransactionClient = db,
  ): Promise<Date | null> {
    const lastTransaction: { createdAt: Date | null }[] = await tx.$queryRaw`
    SELECT
      MAX("created_at") AS "createdAt"
    FROM
      transactions;
  `;

    return lastTransaction[0]?.createdAt || null;
  }

  static async getTransactionMonthsByYear(
    tx: Prisma.TransactionClient = db,
  ): Promise<{ year: number; month: number }[]> {
    const result: { year: number; month: number }[] = await tx.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM "created_at")::integer AS year,
      EXTRACT(MONTH FROM "created_at")::integer AS month
    FROM
      transactions
    GROUP BY
      year, month
    ORDER BY
      year ASC, month ASC;
  `;
    return result;
  }
}
