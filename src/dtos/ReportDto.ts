// DTO dasar untuk filter rentang waktu
export interface IDateRangeRequest {
  startMonth?: number;
  startYear?: number;
  endMonth?: number;
  endYear?: number;
}

export interface IGetRevenueRequest extends IDateRangeRequest {}
export interface IGetTotalTransactionsRequest extends IDateRangeRequest {}
export interface IGetTotalProductsSoldRequest extends IDateRangeRequest {}
export interface IGetTotalActiveUsersRequest extends IDateRangeRequest {}
export interface IGetMonthlyRevenueRequest extends IDateRangeRequest {}
export interface IGetMostSoldProductsDistributionRequest
  extends IDateRangeRequest {}

export interface IGetRevenueResponse {
  totalRevenue: number;
  gainPercentage: number;
}

export interface IGetTotalTransactionsResponse {
  totalTransactions: number;
  gainPercentage: number;
}

export interface IGetTodayTotalTransactionsResponse {
  totalTransactions: number;
  gainPercentage: number;
}

export interface IGetTotalProductsSoldResponse {
  totalProductsSold: number;
  gainPercentage: number;
}

export interface IGetTotalActiveUsersResponse {
  totalActiveUsers: number;
  gainPercentage: number;
  gain: number;
}

export interface IGetMonthlyRevenueResponse {
  revenues: {
    month: number;
    year: number;
    totalRevenue: number;
    gainPercentage: number;
  }[];
}

export interface IGetMostSoldProductsDistributionResponse {
  products: {
    id: string;
    name: string;
    totalSold: number;
    currentMonthSold: number;
  }[];
}

export interface IGetTotalProductsResponse {
  totalProducts: number;
}

export interface IGetCurrentMonthRevenueResponse {
  totalRevenue: number;
  gainPercentage: number;
}

export interface IExportDataRequest extends IDateRangeRequest {
  tables?: string[];
  startDay?: number;
  endDay?: number;
}
