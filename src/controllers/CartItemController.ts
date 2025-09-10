import type { Context } from 'hono'
import { StatusCodes } from 'http-status-codes'

import {
  IAddToCartRequest,
  IUpdateCartItemRequest,
  IRemoveCartItemRequest,
} from '../dtos'
import { CartItemService } from '../services'
import { successResponse } from '../utils'

export class CartItemController {
  static async addToCart(c: Context): Promise<Response> {
    try {
      const body = await c.req.json()

      const request: IAddToCartRequest = {
        userId: c.get('user').userId,
        variantId: body.variantId,
        quantity: body.quantity,
      }

      const response = await CartItemService.addToCart(request)
      return successResponse(
        c,
        StatusCodes.CREATED,
        'Item berhasil ditambahkan ke keranjang',
        response,
      )
    } catch (error) {
      throw error
    }
  }

  static async updateCartItem(c: Context): Promise<Response> {
    try {
      const body = await c.req.json()

      const request: IUpdateCartItemRequest = {
        userId: c.get('user').userId,
        cartItemId: c.req.param('cartItemId'),
        quantity: body.quantity,
      }

      const response = await CartItemService.updateCartItem(request)
      return successResponse(
        c,
        StatusCodes.OK,
        'Item keranjang berhasil diperbarui',
        response,
      )
    } catch (error) {
      throw error
    }
  }

  static async removeCartItem(c: Context): Promise<Response> {
    try {
      const request: IRemoveCartItemRequest = {
        userId: c.get('user').userId,
        cartItemId: c.req.param('cartItemId'),
      }

      await CartItemService.removeCartItem(request)
      return successResponse(c, StatusCodes.OK, 'Item keranjang berhasil dihapus')
    } catch (error) {
      throw error
    }
  }
}
