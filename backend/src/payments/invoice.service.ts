import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary.service';
import * as PDFDocument from 'pdfkit';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  parentName: string;
  childName: string;
  registrationId: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  subscriptionPlan?: 'ANNUAL' | 'FIVE_YEAR';
  planDuration?: string;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Generates a professional PDF invoice and returns the buffer.
   */
  async generateInvoice(data: InvoiceData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 40,
          info: {
            Title: `Invoice - ${data.invoiceNumber}`,
            Author: 'WombTo18 Health Platform',
            Subject: 'Payment Invoice',
          }
        });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Professional green color scheme
        const primaryGreen = '#059669'; // Emerald green
        const darkGreen = '#047857';
        const lightGreen = '#d1fae5';
        const darkColor = '#1e293b';
        const mutedColor = '#64748b';
        const lightBg = '#f0fdf4';

        // ─── Header with Company Info ──────────────────────────────
        // Green header bar
        doc
          .rect(0, 0, doc.page.width, 120)
          .fill(primaryGreen);

        // Company name and logo area
        doc
          .font('Helvetica-Bold')
          .fontSize(32)
          .fillColor('#ffffff')
          .text('WombTo18', 40, 30);

        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#d1fae5')
          .text('Maternal-to-Child Health Platform', 40, 70)
          .text('Email: support@wombto18.com', 40, 88)
          .text('Website: www.wombto18.com', 40, 103);

        // INVOICE label
        doc
          .font('Helvetica-Bold')
          .fontSize(24)
          .fillColor('#ffffff')
          .text('INVOICE', doc.page.width - 180, 45, { width: 140, align: 'right' });

        // ─── Invoice Details Box ───────────────────────────────────
        let y = 145;
        
        // Two-column layout for invoice details
        const leftCol = 40;
        const rightCol = doc.page.width / 2 + 20;
        
        // Left: Bill To
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(primaryGreen)
          .text('BILL TO', leftCol, y);

        y += 20;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(darkColor)
          .text(data.parentName, leftCol, y);

        y += 16;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(mutedColor)
          .text(data.email, leftCol, y);

        y += 14;
        doc.text(data.phone, leftCol, y);

        y += 14;
        doc.text(`Child Name: ${data.childName}`, leftCol, y);

        y += 14;
        doc.text(`Registration ID: ${data.registrationId}`, leftCol, y);

        // Right: Invoice Info
        y = 145;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(primaryGreen)
          .text('INVOICE DETAILS', rightCol, y);

        y += 20;
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(darkColor)
          .text('Invoice Number:', rightCol, y)
          .font('Helvetica')
          .text(data.invoiceNumber, rightCol + 100, y);

        y += 16;
        doc
          .font('Helvetica-Bold')
          .text('Invoice Date:', rightCol, y)
          .font('Helvetica')
          .text(data.date, rightCol + 100, y);

        y += 16;
        doc
          .font('Helvetica-Bold')
          .text('Order ID:', rightCol, y)
          .font('Helvetica')
          .fontSize(8)
          .text(data.razorpayOrderId, rightCol + 100, y, { width: 150 });

        if (data.razorpayPaymentId) {
          y += 16;
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('Payment ID:', rightCol, y)
            .font('Helvetica')
            .fontSize(8)
            .text(data.razorpayPaymentId, rightCol + 100, y, { width: 150 });
        }

        y += 16;
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('Payment Status:', rightCol, y)
          .font('Helvetica-Bold')
          .fillColor(primaryGreen)
          .text('✓ PAID', rightCol + 100, y);

        // ─── Items Table ───────────────────────────────────────────
        y += 35;

        // Table header
        doc
          .rect(40, y, doc.page.width - 80, 30)
          .fill(darkGreen);

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#ffffff')
          .text('DESCRIPTION', 50, y + 10)
          .text('AMOUNT', doc.page.width - 140, y + 10, { width: 100, align: 'right' });

        y += 30;

        // Calculate amounts
        const basePrice = Math.round((data.amount / 1.18) * 100) / 100;
        const gst = Math.round((data.amount - basePrice) * 100) / 100;
        const planName = data.subscriptionPlan === 'ANNUAL' ? 'Annual Plan (1 Year)' : '5-Year Plan (5 Years)';
        const description = `WombTo18 ${planName} — Child Healthcare Subscription`;
        
        // Item row 1: Subscription
        doc
          .rect(40, y, doc.page.width - 80, 35)
          .fillAndStroke(lightBg, '#d1fae5');

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(darkColor)
          .text(description, 50, y + 10, { width: doc.page.width - 200 })
          .font('Helvetica')
          .text(`₹${basePrice.toFixed(2)}`, doc.page.width - 140, y + 10, { width: 100, align: 'right' });

        y += 35;

        // Item row 2: GST
        doc
          .rect(40, y, doc.page.width - 80, 30)
          .fillAndStroke('#ffffff', '#d1fae5');

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(mutedColor)
          .text('GST @ 18%', 50, y + 9)
          .text(`₹${gst.toFixed(2)}`, doc.page.width - 140, y + 9, { width: 100, align: 'right' });

        y += 30;

        // Subtotal row
        doc
          .rect(40, y, doc.page.width - 80, 30)
          .fillAndStroke(lightGreen, '#a7f3d0');

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(darkColor)
          .text('Subtotal', 50, y + 9)
          .text(`₹${data.amount.toFixed(2)}`, doc.page.width - 140, y + 9, { width: 100, align: 'right' });

        y += 30;

        // Total row (prominent)
        doc
          .rect(40, y, doc.page.width - 80, 40)
          .fill(primaryGreen);

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor('#ffffff')
          .text('TOTAL AMOUNT', 50, y + 12)
          .fontSize(16)
          .text(`₹${data.amount.toFixed(2)}`, doc.page.width - 140, y + 12, { width: 100, align: 'right' });

        // ─── Payment Info ───────────────────────────────────────────
        y += 60;
        
        // Payment confirmation box
        doc
          .rect(40, y, doc.page.width - 80, 50)
          .fillAndStroke('#ecfdf5', '#a7f3d0');

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(primaryGreen)
          .text('✓ PAYMENT RECEIVED', 50, y + 10);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(darkColor)
          .text(`Payment Method: ${data.paymentMethod ? data.paymentMethod.toUpperCase() : 'ONLINE'}`, 50, y + 28);

        doc
          .text(`Transaction Date: ${data.date}`, 50, y + 40);

        // ─── Footer ─────────────────────────────────────────────────
        const footerY = doc.page.height - 100;

        // Thank you message
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(primaryGreen)
          .text('Thank you for choosing WombTo18!', 40, footerY, { align: 'center', width: doc.page.width - 80 });

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(mutedColor)
          .text(
            'We are committed to providing the best maternal and child healthcare services.',
            40,
            footerY + 18,
            { align: 'center', width: doc.page.width - 80 },
          );

        // Divider
        doc
          .moveTo(40, footerY + 38)
          .lineTo(doc.page.width - 40, footerY + 38)
          .strokeColor('#d1fae5')
          .lineWidth(1)
          .stroke();

        // Footer info
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(mutedColor)
          .text(
            'This is a computer-generated invoice and does not require a physical signature.',
            40,
            footerY + 48,
            { align: 'center', width: doc.page.width - 80 },
          )
          .text(
            'For any queries, please contact us at support@wombto18.com | www.wombto18.com',
            40,
            footerY + 62,
            { align: 'center', width: doc.page.width - 80 },
          );

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate invoice PDF', err);
        reject(err);
      }
    });
  }

  /**
   * Generate invoice and upload to Cloudinary
   */
  async generateAndUploadInvoice(data: InvoiceData): Promise<{ buffer: Buffer; cloudinaryUrl: string }> {
    const buffer = await this.generateInvoice(data);
    
    // Try to upload to Cloudinary if configured
    let cloudinaryUrl = '';
    try {
      if (this.cloudinaryService.isConfigured()) {
        const cloudinaryResult = await this.cloudinaryService.uploadInvoicePDF(
          buffer,
          data.registrationId
        );
        cloudinaryUrl = cloudinaryResult.url;
        this.logger.log(`Invoice uploaded to Cloudinary: ${cloudinaryUrl}`);
      } else {
        this.logger.warn('Cloudinary not configured, invoice will not be stored in cloud');
      }
    } catch (error) {
      this.logger.error(`Failed to upload invoice to Cloudinary: ${error instanceof Error ? error.message : error}`);
    }

    return {
      buffer,
      cloudinaryUrl,
    };
  }
}
