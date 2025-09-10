import type { Context } from 'hono'
import { StatusCodes } from 'http-status-codes'

import { IClearCartRequest, IGetCartRequest } from '../dtos'
import { CartService } from '../services'
import { successResponse } from '../utils'

export class CartController {
  static async getCart(c: Context): Promise<Response> {
    try {
      const request: IGetCartRequest = {
        userId: c.get('user').userId,
      }
      const response = await CartService.getCart(request)
      return successResponse(
        c,
        StatusCodes.OK,
        'Keranjang berhasil diambil',
        response,
      )
    } catch (error) {
      throw error
    }
  }

  static async clearCart(c: Context): Promise<Response> {
    try {
      const request: IClearCartRequest = {
        userId: c.get('user').userId,
      }
      await CartService.clearCart(request)
      return successResponse(c, StatusCodes.OK, 'Keranjang berhasil dikosongkan')
    } catch (error) {
      throw error
    }
  }
}
