import axios from 'axios';

import { currentEnv, Env, MIDTRANS_SECRET } from '../constants';
import { CLIENT_URL_CURRENT } from './client-url-utils';
import { ResponseError } from '../error/ResponseError';
import { ITransactionItem } from 'dtos';
import { appLogger } from '../configs/logger';

export class PaymentUtils {
  static async sendToPaymentGateway(
    transactionId: string,
    ppnAmount: number,
    grossAmount: number,
    transactionItems: ITransactionItem[],
    customerDetails: {
      first_name: string;
      last_name?: string;
      email: string;
      phone: string;
      address: string;
      shipping_address?: {
        first_name: string;
        last_name?: string;
        address: string;
        phone: string;
        city: string;
        postal_code: string;
      };
    },
    shippingCost: number,
  ): Promise<any> {
    const authString = btoa(`${MIDTRANS_SECRET.MIDTRANS_SERVER_KEY}:`);

    const itemDetails = [
      ...transactionItems.map(item => ({
        id: item.variantId,
        price: item.priceRupiah / item.quantity,
        quantity: item.quantity,
        name: item.productName,
        weight_in_kg: item.weight_in_kg,
        packaging: item.packaging,
        product_id: item.productId,
      })),
      {
        id: 'shipping_cost',
        price: shippingCost,
        quantity: 1,
        name: 'Biaya Pengiriman',
      },
      {
        id: 'ppn',
        price: ppnAmount,
        quantity: 1,
        name: 'PPN',
      },
    ];
    const transactionPayload = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerDetails.first_name,
        last_name: customerDetails.last_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address,
        shipping_address: customerDetails.shipping_address
          ? {
              first_name: customerDetails.shipping_address.first_name,
              last_name: customerDetails.shipping_address.last_name,
              address: customerDetails.shipping_address.address,
              city: customerDetails.shipping_address.city,
              phone: customerDetails.shipping_address.phone,
              postal_code: customerDetails.shipping_address.postal_code,
            }
          : undefined,
      },
      callbacks: {
        finish: `${CLIENT_URL_CURRENT}/transactions?transaction_id=${transactionId}`,
        error: `${CLIENT_URL_CURRENT}/transactions?transaction_id=${transactionId}`,
        pending: `${CLIENT_URL_CURRENT}/transactions?transaction_id=${transactionId}`,
      },
    };

    try {
      const response = await axios.post(
        `${MIDTRANS_SECRET.MIDTRANS_APP_URL}/snap/v1/transactions`,
        transactionPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`,
          },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('Midtrans API Response:', response.data);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('Midtrans API Error:', error.response?.data);
        throw new ResponseError(
          error.response?.status || 500,
          error.response?.data?.error_messages?.join(', ') ||
            'Failed to create transaction',
        );
      }

      appLogger.error('Unexpected error in sendToPaymentGateway:', error);
      throw error;
    }
  }

  static async checkTransactionStatus(transactionId: string): Promise<any> {
    const authString = btoa(`${MIDTRANS_SECRET.MIDTRANS_SERVER_KEY}:`);

    try {
      const response = await axios.get(
        `${MIDTRANS_SECRET.MIDTRANS_APP_URL}/v2/${transactionId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`,
          },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('Midtrans Transaction Status Response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('Midtrans API Error:', error.response?.data);
        throw new ResponseError(
          error.response?.status || 500,
          error.response?.data?.error_messages?.join(', ') ||
            'Failed to check transaction status',
        );
      }

      appLogger.error('Unexpected error in checkTransactionStatus:', error);
      throw error;
    }
  }

  static async refundTransaction(
    transactionId: string,
    reason: string,
  ): Promise<any> {
    const authString = btoa(`${MIDTRANS_SECRET.MIDTRANS_SERVER_KEY}:`);

    const refundPayload = {
      reason,
    };

    try {
      const response = await axios.post(
        `${MIDTRANS_SECRET.MIDTRANS_APP_URL}/v2/${transactionId}/refund`,
        refundPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`,
          },
        },
      );

      console.log('Midtrans Refund Response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Midtrans Refund Error:', error.response?.data);
        throw new ResponseError(
          error.response?.status || 500,
          error.response?.data?.error_messages?.join(', ') ||
            'Failed to process refund',
        );
      }

      console.error('Unexpected error in refundTransaction:', error);
      throw error;
    }
  }
}
