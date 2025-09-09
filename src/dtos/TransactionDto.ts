import { TxDeliveryStatus, TxManualStatus, TxMethod } from '@prisma/client';

export interface ICreateTransactionRequest {
  userId: string;
  district: number;
  subDistrict: number;
  city: number;
  province: number;
  shippingCode?: string;
  shippingService?: string;
  postalCode: string;
  shippingAddress: string;
  method: TxMethod;
}

export interface ICreateTransactionResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoneNumber: string;
  method: TxMethod;
  deliveryStatus?: TxDeliveryStatus;
  manualStatus?: TxManualStatus;
  cleanPrice: number;
  priceWithPPN: number;
  totalPrice: number;
  totalWeightInKg: number;
  PPNPercentage?: number;
  snapToken?: string;
  snapUrl?: string;
  district: string;
  subDistrict: string;
  city: string;
  province: string;
  postalCode: string;
  shippingAddress: string;
  shippingAgent?: string;
  shippingCode?: string;
  shippingService?: string;
  shippingEstimate?: string;
  shippingCost?: number;
  manualShippingCost?: number;
  paymentMethod?: string;
  isRefundFailed?: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequestPaymentRequest {
  transactionId: string;
  userId: string;
}

export interface IRequestPaymentResponse {
  snapToken: string;
  snapUrl: string;
}

export interface IGetTransactionRequest {
  id: string;
  userId: string;
  userRole: string;
}

export interface IGetTransactionResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoneNumber: string;
  method: TxMethod;
  deliveryStatus?: TxDeliveryStatus;
  manualStatus?: TxManualStatus;
  cleanPrice: number;
  priceWithPPN: number;
  totalPrice: number;
  totalWeightInKg: number;
  PPNPercentage?: number;
  snapToken?: string;
  snapUrl?: string;
  district: string;
  subDistrict: string;
  city: string;
  province: string;
  postalCode: string;
  shippingAddress: string;
  shippingAgent?: string;
  shippingCode?: string;
  shippingService?: string;
  shippingEstimate?: string;
  shippingCost?: number;
  shippingReceipt?: string;
  manualShippingCost?: number;
  paymentMethod?: string;
  transactionItems: {
    id: string;
    quantity: number;
    priceRupiah: number;
    isStockIssue: boolean;
    variant: {
      id: string;
      weight_in_kg: number;
      imageUrl?: string;
      priceRupiah: number;
      product: {
        id: string;
        name: string;
        imageUrl?: string;
      };
      packaging?: {
        id: string;
        name: string;
      };
      stock: number;
    };
  }[];
  isRefundFailed?: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetAllTransactionsRequest {
  page?: number;
  limit?: number;
  method?: TxMethod;
  search?: string;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  status?: TxDeliveryStatus | TxManualStatus;
  isStockIssue?: boolean;
}

export interface IGetAllTransactionsResponse {
  totalPage: number;
  currentPage: number;
  transactions: IGetTransactionResponse[];
}

export interface IGetTransactionByUserRequest {
  userId: string;
  currentUserId: string;
  currentUserRole: string;
  method?: TxMethod;
  search?: string;
  status?: TxDeliveryStatus | TxManualStatus;
  isStockIssue?: boolean;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  page?: number;
  limit?: number;
}

export interface IGetTransactionByUserResponse {
  totalPage: number;
  currentPage: number;
  transactions: IGetTransactionResponse[];
}

export interface IUpdateTransactionRequest {
  id: string;
  deliveryStatus?: TxDeliveryStatus;
  manualStatus?: TxManualStatus;
  shippingReceipt?: string;
}

export interface IUpdateTransactionResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoneNumber: string;
  method: TxMethod;
  deliveryStatus?: TxDeliveryStatus;
  manualStatus?: TxManualStatus;
  cleanPrice: number;
  priceWithPPN: number;
  totalPrice: number;
  totalWeightInKg: number;
  PPNPercentage?: number;
  snapToken?: string;
  snapUrl?: string;
  district: string;
  subDistrict: string;
  city: string;
  province: string;
  postalCode: string;
  shippingAddress: string;
  shippingAgent?: string;
  shippingCode?: string;
  shippingService?: string;
  shippingEstimate?: string;
  shippingCost?: number;
  shippingReceipt?: string;
  manualShippingCost?: number;
  paymentMethod?: string;
  isRefundFailed?: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICancelTransactionRequest {
  id: string;
  userId: string;
  cancelReason: string;
  userRole: string;
}

export interface ICancelTransactionResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoneNumber: string;
  method: TxMethod;
  deliveryStatus?: TxDeliveryStatus;
  manualStatus?: TxManualStatus;
  cleanPrice: number;
  priceWithPPN: number;
  totalPrice: number;
  totalWeightInKg: number;
  PPNPercentage?: number;
  snapToken?: string;
  snapUrl?: string;
  district: string;
  subDistrict: string;
  city: string;
  province: string;
  postalCode: string;
  shippingAddress: string;
  shippingAgent?: string;
  shippingCode?: string;
  shippingService?: string;
  shippingEstimate?: string;
  shippingCost?: number;
  shippingReceipt?: string;
  manualShippingCost?: number;
  paymentMethod?: string;
  isRefundFailed?: boolean;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGetTxStatusListResponse {
  deliveryStatusList: TxDeliveryStatus[];
  manualStatusList: TxManualStatus[];
}

export interface IGetTxMethodListResponse {
  txMethodList: TxMethod[];
}

export interface IAddManualShippingCostRequest {
  transactionId: string;
  manualShippingCost: number;
}

export interface IUpdateShippingReceiptRequest {
  transactionId: string;
  shippingReceipt: string;
}

export interface IUpdateShippingReceiptResponse
  extends IUpdateTransactionResponse {}

export interface ITransactionNotifRequest {
  transactionId: string;
  transactionStatus: string;
  fraudStatus: string;
  statusCode: string;
  grossAmount: string;
  paymentType: string;
}

export interface IGetAllTransactionDateRangeResponse {
  firstDate: Date | null;
  lastDate: Date | null;
  yearMonthsMap: {
    [year: number]: {
      months: number[];
    };
  };
}
