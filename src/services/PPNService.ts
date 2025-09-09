import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import { db as database } from '../configs/database';
import type {
  IUpdatePPNRequest,
  IUpdatePPNResponse,
  IGetPPNResponse,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { PPNRepository } from '../repositories';
import { Validator } from '../utils';
import { PPNValidation } from '../validations';

export class PPNService {
  static async getCurrentPPN(): Promise<IGetPPNResponse> {
    const currentPPN = await PPNRepository.findCurrentPPN();
    if (!currentPPN) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'PPN tidak ditemukan');
    }

    return { percentage: currentPPN.percentage };
  }

  static async updatePPN(
    request: IUpdatePPNRequest,
  ): Promise<IUpdatePPNResponse> {
    const validData = Validator.validate(PPNValidation.UPDATE, request);

    const db = database;

    try {
      const beginTransaction = await db.$transaction(async tx => {
        let currentPPN = await PPNRepository.findCurrentPPN(tx);
        if (!currentPPN) {
          currentPPN = await PPNRepository.createPPN(
            {
              id: 'PPN-' + uuid(),
              percentage: validData.percentage,
            },
            tx,
          );
          return { percentage: currentPPN.percentage };
        }

        const updatedPPN = await PPNRepository.updatePPN(
          currentPPN.id,
          {
            percentage: validData.percentage,
          },
          tx,
        );

        return { percentage: updatedPPN.percentage };
      });

      return beginTransaction;
    } catch (error) {
      throw error;
    }
  }
}
