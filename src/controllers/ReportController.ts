import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { ReportService } from '../services';
import { successResponse, ZipUtils } from '../utils';
import {
  IGetRevenueRequest,
  IGetTotalTransactionsRequest,
  IGetTotalProductsSoldRequest,
  IGetTotalActiveUsersRequest,
  IGetMonthlyRevenueRequest,
  IGetMostSoldProductsDistributionRequest,
  IExportDataRequest,
} from '../dtos';

export class ReportController {
  static async exportData(c: Context): Promise<void> {
    try {
      const tables = c.req.query().tables
        ? String(c.req.query().tables)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

      const request: IExportDataRequest = {
        tables,
        startYear: c.req.query().startYear
          ? Number(c.req.query().startYear)
          : undefined,
        startMonth: c.req.query().startMonth
          ? Number(c.req.query().startMonth)
          : undefined,
        startDay: c.req.query().startDay
          ? Number(c.req.query().startDay)
          : undefined,
        endYear: c.req.query().endYear
          ? Number(c.req.query().endYear)
          : undefined,
        endMonth: c.req.query().endMonth
          ? Number(c.req.query().endMonth)
          : undefined,
        endDay: c.req.query().endDay ? Number(c.req.query().endDay) : undefined,
      };

      const files = await ReportService.exportData(request);
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 14);
      await ZipUtils.pipeZipToResponse(
        c,
        files,
        `reports_export_${timestamp}.zip`,
      );
    } catch (error) {
      throw error;
    }
  }
  static async getRevenue(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetRevenueRequest;
      const response = await ReportService.getRevenue(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Revenue berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTotalTransactions(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetTotalTransactionsRequest;
      const response = await ReportService.getTotalTransactions(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Total transaksi berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTotalProductsSold(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetTotalProductsSoldRequest;
      const response = await ReportService.getTotalProductsSold(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Total produk terjual berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTotalActiveUsers(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetTotalActiveUsersRequest;
      const response = await ReportService.getTotalActiveUsers(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Total pengguna aktif berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyRevenue(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetMonthlyRevenueRequest;
      const response = await ReportService.getMonthlyRevenue(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Data pendapatan bulanan berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getMostSoldProductsDistribution(c: Context): Promise<void> {
    try {
      const request = c.req.query() as IGetMostSoldProductsDistributionRequest;
      const response =
        await ReportService.getMostSoldProductsDistribution(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Data distribusi produk terlaris berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTodayTotalTransactions(c: Context): Promise<void> {
    try {
      const response = await ReportService.getTodayTotalTransactions();
      successResponse(
        c,
        StatusCodes.OK,
        'Data total transaksi hari ini berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getCurrentMonthRevenue(c: Context): Promise<void> {
    try {
      const response = await ReportService.getCurrentMonthRevenue();
      successResponse(
        c,
        StatusCodes.OK,
        'Data pendapatan bulan ini berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getTotalProducts(c: Context): Promise<void> {
    try {
      const response = await ReportService.getTotalProducts();
      successResponse(
        c,
        StatusCodes.OK,
        'Total produk berhasil diperoleh',
        response,
      );
    } catch (error) {
      throw error;
    }
  }
}
