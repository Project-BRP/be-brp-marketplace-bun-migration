import path from 'path';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { ResponseError } from '../error/ResponseError';
import { CompanyInfoRepository } from '../repositories';
import { IUploadLogoRequest, IUploadLogoResponse } from '../dtos';
import { SharpUtils } from '../utils';
import { db } from '../configs/database';
import { appLogger } from '../configs/logger';

export class ConfigService {
  static async uploadLogo(
    request: IUploadLogoRequest,
  ): Promise<IUploadLogoResponse> {
    const mainDirectory = process.env.UPLOADS_PATH;
    const logoPath = path.join(__dirname, '..', '..', mainDirectory, 'logo');

    if (!fs.existsSync(logoPath)) {
      fs.mkdirSync(logoPath, { recursive: true });
    }

    // hapus logo lama kalau ada
    const files = fs.readdirSync(logoPath);
    for (const file of files) {
      const filePath = path.join(logoPath, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // simpan logo baru (langsung dari File)
    const resizedLogoPath = await SharpUtils.saveLogo(request.file);

    try {
      const txResult = await db.$transaction(async tx => {
        const existingCompanyInfo = await CompanyInfoRepository.findFirst(tx);

        if (!existingCompanyInfo) {
          throw new ResponseError(
            StatusCodes.BAD_REQUEST,
            'Informasi perusahaan belum dibuat',
          );
        }

        const updateData = {
          logoUrl: resizedLogoPath,
        };

        await CompanyInfoRepository.update(
          existingCompanyInfo.id,
          updateData,
          tx,
        );

        return { resizedLogoPath };
      });

      return txResult;
    } catch (error) {
      if (resizedLogoPath && fs.existsSync(resizedLogoPath)) {
        try {
          await fs.promises.unlink(resizedLogoPath);
        } catch (e) {
          appLogger.error('Gagal menghapus file upload:', resizedLogoPath, e);
        }
      }
      throw error;
    }
  }

  static async getLogo(): Promise<string> {
    const mainDirectory = process.env.UPLOADS_PATH;
    const logoPath = path.join(__dirname, '..', '..', mainDirectory, 'logo');

    if (!fs.existsSync(logoPath)) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Logo tidak ditemukan');
    }

    const files = fs.readdirSync(logoPath);
    if (files.length === 0) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Logo tidak ditemukan');
    }

    const logoFile = files[0];
    return path.join('logo', logoFile).replace(/\\/g, '/');
  }
}
