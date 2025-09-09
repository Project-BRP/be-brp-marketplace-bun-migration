import fs from 'fs';
import path from 'path';
import {
  IEmailDto,
  IEmailVerificationPayload,
  IGetTransactionResponse,
} from '../dtos';
import { SMPTP_CONSTANTS } from '../constants';
import { SendToKafka } from '../kafka';
import { CLIENT_URL_CURRENT } from './client-url-utils';
import { PDFUtils } from './pdf-utils';
import { appLogger } from '../configs/logger';

export class EmailUtils {
  static async sendVerificationEmail(
    payload: IEmailVerificationPayload,
    token: string,
  ): Promise<void> {
    try {
      const verificationLink = `${CLIENT_URL_CURRENT}/sign-up/${token}`;

      const templatePath = path.join(__dirname, 'email-verification.html');
      let emailHtml = fs.readFileSync(templatePath, 'utf-8');
      emailHtml = emailHtml.replace('{{verification_link}}', verificationLink);

      const logoUrl = EmailUtils.getLogoUrl();
      emailHtml = emailHtml.replace('{{logo_url}}', logoUrl);

      const emailData: IEmailDto = {
        from: SMPTP_CONSTANTS.SMTP_EMAIL,
        to: payload.email,
        subject: 'Verifikasi Email',
        html: emailHtml,
      };

      await SendToKafka.sendEmailMessage(emailData);
    } catch (error) {
      appLogger.error('Error sending verification email:', error);
    }
  }

  static async sendResetPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      const resetLink = `${CLIENT_URL_CURRENT}/forget-password/${token}`;

      const templatePath = path.join(__dirname, 'reset-password-template.html');
      let emailHtml = fs.readFileSync(templatePath, 'utf-8');
      emailHtml = emailHtml.replace('{{reset_link}}', resetLink);

      const logoUrl = EmailUtils.getLogoUrl();
      emailHtml = emailHtml.replace('{{logo_url}}', logoUrl);

      const emailData: IEmailDto = {
        from: SMPTP_CONSTANTS.SMTP_EMAIL,
        to: email,
        subject: 'Reset Password',
        html: emailHtml,
      };

      await SendToKafka.sendEmailMessage(emailData);
    } catch (error) {
      appLogger.error('Error sending reset password email:', error);
    }
  }

  static async sendInvoiceEmail(transaction: IGetTransactionResponse) {
    const pdfPath = await PDFUtils.createInvoice(transaction);
    try {
      const templatePath = path.join(__dirname, 'invoice-email-template.html');
      let emailHtml = fs.readFileSync(templatePath, 'utf-8');

      const logoUrl = EmailUtils.getLogoUrl();
      emailHtml = emailHtml.replace('{{logo_url}}', logoUrl);

      const emailData: IEmailDto = {
        from: SMPTP_CONSTANTS.SMTP_EMAIL,
        to: transaction.userEmail,
        subject: 'Invoice Pembelian Anda',
        html: emailHtml,
        attachments: [
          {
            filename: `invoice_${transaction.id}.pdf`,
            path: pdfPath,
            contentType: 'application/pdf',
          },
        ],
      };

      await SendToKafka.sendEmailMessage(emailData);
    } catch (error) {
      appLogger.error('Error sending invoice email:', error);
      fs.unlink(pdfPath, err => {
        if (err) appLogger.error('Gagal hapus file invoice:', err);
      });
    }
  }

  static async sendShippingNotificationEmail(
    transaction: IGetTransactionResponse,
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        'shipping-notification-template.html',
      );
      let emailHtml = fs.readFileSync(templatePath, 'utf-8');

      const logoUrl = EmailUtils.getLogoUrl();
      emailHtml = emailHtml.replace('{{logo_url}}', logoUrl);
      emailHtml = emailHtml.replace('{{transaction_id}}', transaction.id);
      emailHtml = emailHtml.replace(
        '{{tracking_number}}',
        transaction.shippingReceipt || '-',
      );

      const emailData: IEmailDto = {
        from: SMPTP_CONSTANTS.SMTP_EMAIL,
        to: transaction.userEmail,
        subject: 'Pesanan Anda Sedang Dikirim',
        html: emailHtml,
      };

      await SendToKafka.sendEmailMessage(emailData);
    } catch (error) {
      appLogger.error('Error sending shipping notification email:', error);
    }
  }

  static async sendCancellationEmail(
    transaction: IGetTransactionResponse,
    options?: { cancelledByAdmin?: boolean },
  ): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        'transaction-cancel-template.html',
      );
      let emailHtml = fs.readFileSync(templatePath, 'utf-8');

      const logoUrl = EmailUtils.getLogoUrl();
      emailHtml = emailHtml.replace('{{logo_url}}', logoUrl);
      emailHtml = emailHtml.replace('{{transaction_id}}', transaction.id);
      emailHtml = emailHtml.replace(
        '{{cancel_reason}}',
        transaction.cancelReason || '-',
      );

      const stockIssues = (transaction.transactionItems || []).filter(
        item => item.isStockIssue === true,
      );

      let stockIssueSection = '';
      if (options?.cancelledByAdmin && stockIssues.length > 0) {
        const itemsHtml = stockIssues
          .map(item => {
            const name = item.variant?.product?.name || 'Produk';
            const packaging = item.variant?.packaging?.name
              ? ` - ${item.variant.packaging.name}`
              : '';
            return `<li>${name}${packaging} — Qty: ${item.quantity}</li>`;
          })
          .join('');

        stockIssueSection = `
          <div class="stock-issue">
            <h3>Catatan Stok Bermasalah</h3>
            <p>Ditemukan item dengan kendala stok saat pembatalan:</p>
            <ul>${itemsHtml}</ul>
          </div>`;
      }

      emailHtml = emailHtml.replace(
        '{{stock_issue_section}}',
        stockIssueSection,
      );

      const emailData: IEmailDto = {
        from: SMPTP_CONSTANTS.SMTP_EMAIL,
        to: transaction.userEmail,
        subject: 'Transaksi Dibatalkan',
        html: emailHtml,
      };

      await SendToKafka.sendEmailMessage(emailData);
    } catch (error) {
      appLogger.error('Error sending cancellation email:', error);
    }
  }

  private static getLogoUrl(): string {
    const serverDomain = process.env.SERVER_DOMAIN;
    const uploadPath = process.env.UPLOADS_PATH;

    const logoDir = path.join(__dirname, '..', '..', uploadPath, 'logo');
    if (!fs.existsSync(logoDir)) {
      appLogger.error('Direktori logo tidak ditemukan');
      return '';
    }
    const logoName = fs
      .readdirSync(logoDir)
      .find(file => /\.(png|jpg|jpeg|webp)$/i.test(file));

    if (!logoName) {
      appLogger.error('Logo tidak ditemukan');
      return '';
    }

    return `${serverDomain}/${uploadPath}/logo/${logoName}`;
  }
}
