import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { IGetTransactionResponse } from '../dtos';
import { TxMethod } from '@prisma/client';
import { appLogger } from '../configs/logger';
import { CompanyInfoRepository } from '../repositories';

const THEME_COLOR = '#28a745';
const SECONDARY_COLOR = '#333333';
const LIGHT_GRAY = '#f5f5f5';
const DARK_GRAY = '#888888';
const TABLE_HEADER_COLOR = '#1e7e34';

export class PDFUtils {
  static async createInvoice(
    transaction: IGetTransactionResponse,
  ): Promise<string> {
    try {
      const companyInfo = await CompanyInfoRepository.findFirst();
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `Invoice ${transaction.id}`,
          Author: companyInfo?.companyName || '-',
        },
      });

      const invoiceDir = process.env.INVOICE_PATH;

      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const invoicePath = path.join(
        __dirname,
        '..',
        '..',
        process.env.INVOICE_PATH!,
        `invoice_${transaction.id}.pdf`,
      );

      if (!fs.existsSync(path.dirname(invoicePath))) {
        fs.mkdirSync(path.dirname(invoicePath), { recursive: true });
      }

      doc.pipe(fs.createWriteStream(invoicePath));

      const uploadsPath = path.join(
        __dirname,
        '..',
        '..',
        process.env.UPLOADS_PATH!,
        'logo',
      );
      const logoFile = fs
        .readdirSync(uploadsPath)
        .find(file => /\.(png|jpeg)$/i.test(file));
      const logoPath = logoFile ? path.join(uploadsPath, logoFile) : null;

      if (logoPath) {
        doc.image(logoPath, 50, 45, { width: 70 });
      }

      doc
        .fillColor(SECONDARY_COLOR)
        .fontSize(10)
        .text('INVOICE', { align: 'right' })
        .moveDown(0.3);

      doc
        .fillColor(THEME_COLOR)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(companyInfo?.companyName || '-', { align: 'right' })
        .fontSize(9)
        .font('Helvetica')
        .fillColor(DARK_GRAY)
        .text(companyInfo?.fullAddress || '-', { align: 'right' })
        .text(
          `Telp: ${companyInfo?.phoneNumber || '-'} | Email: ${companyInfo?.email || '-'}`,
          {
            align: 'right',
          },
        )
        .text(`NPWP: ${companyInfo?.npwp || '-'}`, { align: 'right' })
        .moveDown(1.5);

      doc
        .fillColor(THEME_COLOR)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`INVOICE #${transaction.id}`, { align: 'left' })
        .moveDown(0.3);

      const status =
        transaction.deliveryStatus ?? transaction.manualStatus ?? '-';
      const tanggalFormatted = DateTime.fromISO(
        transaction.createdAt instanceof Date
          ? transaction.createdAt.toISOString()
          : transaction.createdAt,
      )
        .setZone('Asia/Jakarta')
        .toFormat('dd MMMM yyyy, HH:mm');

      doc
        .fillColor(SECONDARY_COLOR)
        .fontSize(10)
        .text(`Tanggal: ${tanggalFormatted}`, { align: 'left' })
        .text(`Status: ${status}`, { align: 'left' })
        .moveDown(1.5);

      doc
        .fillColor(THEME_COLOR)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('INFORMASI PELANGGAN', { align: 'left' })
        .moveDown(0.3);

      doc
        .fillColor(SECONDARY_COLOR)
        .fontSize(10)
        .font('Helvetica')
        .text(`Nama: ${transaction.userName}`, { align: 'left' })
        .text(`Email: ${transaction.userEmail}`, { align: 'left' })
        .text(`Telepon: ${transaction.userPhoneNumber}`, { align: 'left' })
        .text(`Metode Pembayaran: ${transaction.paymentMethod || '-'}`, {
          align: 'left',
        })
        .text(`Alamat Pengiriman: ${transaction.shippingAddress || '-'}`, {
          align: 'left',
        })
        .moveDown(1.5);

      doc
        .fillColor(THEME_COLOR)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('DAFTAR BARANG', { align: 'left' })
        .moveDown(0.3);

      const col1 = doc.page.margins.left;
      const tableRight = doc.page.width - doc.page.margins.right;
      const totalTableWidth = tableRight - col1;

      const colWidths = {
        no: 25,
        name: 220,
        qty: 50,
        unitPrice: 110,
        total: 90,
      };

      const col2 = col1 + colWidths.no;
      const col3 = col2 + colWidths.name;
      const col4 = col3 + colWidths.qty;
      const col5 = col4 + colWidths.unitPrice;

      const tableTop = doc.y;

      doc
        .fillColor('#ffffff')
        .rect(col1, tableTop, totalTableWidth, 20)
        .fill(TABLE_HEADER_COLOR)
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('No', col1 + 5, tableTop + 5)
        .text('Nama Barang', col2, tableTop + 5)
        .text('Qty', col3, tableTop + 5, {
          width: colWidths.qty,
          align: 'right',
        })
        .text('Harga Satuan', col4, tableTop + 5, {
          width: colWidths.unitPrice,
          align: 'right',
        })
        .text('Total', col5, tableTop + 5, {
          width: colWidths.total,
          align: 'right',
        });

      let y = tableTop + 20;
      const items = transaction.transactionItems.filter(
        item => !item.isStockIssue,
      );

      items.forEach((item, index) => {
        const { product, packaging } = item.variant;
        const productName = product.name;
        const packagingName = packaging ? ` (${packaging.name})` : '';
        const totalPrice = item.priceRupiah;

        const textWidth = colWidths.name - 10;
        const textHeight = doc
          .font('Helvetica')
          .fontSize(10)
          .heightOfString(`${productName}${packagingName}`, {
            width: textWidth,
          });
        const rowHeight = Math.max(20, textHeight + 10);

        if (index % 2 === 0) {
          doc
            .fillColor(LIGHT_GRAY)
            .rect(col1, y, totalTableWidth, rowHeight)
            .fill();
        }

        doc
          .fillColor(SECONDARY_COLOR)
          .fontSize(10)
          .font('Helvetica')
          .text(`${index + 1}.`, col1 + 5, y + (rowHeight / 2 - 4))
          .text(
            `${productName}${packagingName}`,
            col2,
            y + (rowHeight / 2 - 4),
            {
              width: textWidth,
            },
          )
          .text(item.quantity.toString(), col3, y + (rowHeight / 2 - 4), {
            width: colWidths.qty,
            align: 'right',
          })
          .text(
            `Rp${item.priceRupiah.toLocaleString('id-ID')}`,
            col4,
            y + (rowHeight / 2 - 4),
            { width: colWidths.unitPrice, align: 'right' },
          )
          .text(
            `Rp${totalPrice.toLocaleString('id-ID')}`,
            col5,
            y + (rowHeight / 2 - 4),
            { width: colWidths.total, align: 'right' },
          );

        doc
          .strokeColor('#dddddd')
          .lineWidth(0.5)
          .moveTo(col1, y + rowHeight)
          .lineTo(tableRight, y + rowHeight)
          .stroke();

        y += rowHeight;
      });

      doc
        .strokeColor(DARK_GRAY)
        .lineWidth(1)
        .moveTo(col1, y)
        .lineTo(tableRight, y)
        .stroke();

      doc.y = y + 15;

      const addTotalLine = (
        label: string,
        value: number,
        options: { bold?: boolean; color?: string } = {},
      ) => {
        const lineWidth = 110;
        const valueX = tableRight - lineWidth;
        const labelX = valueX - lineWidth;
        const currentY = doc.y;

        doc
          .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(10)
          .fillColor(options.color || SECONDARY_COLOR)
          .text(label, labelX, currentY, { width: lineWidth, align: 'right' })
          .text(`Rp${value.toLocaleString('id-ID')}`, valueX, currentY, {
            width: lineWidth,
            align: 'right',
          });

        doc.moveDown(0.4);
      };

      addTotalLine('Subtotal:', transaction.cleanPrice);
      addTotalLine(
        `PPN (${transaction.PPNPercentage || 0}%):`,
        transaction.priceWithPPN - transaction.cleanPrice,
      );
      if (transaction.method === TxMethod.DELIVERY) {
        addTotalLine('Biaya Pengiriman:', transaction.shippingCost || 0);
      }

      doc
        .strokeColor(DARK_GRAY)
        .lineWidth(0.5)
        .moveTo(tableRight - 220, doc.y)
        .lineTo(tableRight, doc.y)
        .stroke();
      doc.moveDown(0.4);

      addTotalLine('TOTAL:', transaction.totalPrice, {
        bold: true,
        color: THEME_COLOR,
      });
      doc.moveDown(1);

      const footerText = [
        'Terima kasih telah berbelanja dengan kami.',
        'Invoice ini sah dan diproses oleh komputer.',
        `© ${new Date().getFullYear()} PT. BUMI REKAYASA PERSADA - All Rights Reserved`,
      ];

      const footerHeight = footerText.length * 12 + 10;
      const bottomMargin = 40;

      if (doc.y + footerHeight > doc.page.height - bottomMargin) {
        doc.addPage();
      }

      doc.fillColor(DARK_GRAY).fontSize(8).font('Helvetica');
      footerText.forEach(text => {
        doc.text(text, 50, doc.y, {
          align: 'center',
          width: doc.page.width - 100,
        });
        doc.y += 12;
      });

      doc.end();
      return invoicePath;
    } catch (err) {
      appLogger.error('Gagal membuat invoice PDF:', err);
      return '';
    }
  }
}
