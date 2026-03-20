import { Injectable, Logger } from '@nestjs/common';
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

  /**
   * Generates a professional PDF invoice and returns the buffer.
   */
  async generateInvoice(data: InvoiceData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const primaryColor = '#2563eb';
        const darkColor = '#1e293b';
        const mutedColor = '#64748b';
        const lightBg = '#f8fafc';

        // ─── Header ─────────────────────────────────────────────────
        doc
          .rect(0, 0, doc.page.width, 100)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(28)
          .fillColor('#ffffff')
          .text('WombTo18', 50, 35);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#dbeafe')
          .text('Maternal-to-Child Health Platform', 50, 68);

        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .fillColor('#ffffff')
          .text('INVOICE', doc.page.width - 200, 40, { width: 150, align: 'right' });

        // ─── Invoice Meta ───────────────────────────────────────────
        let y = 120;

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(darkColor)
          .text('Invoice Number:', 50, y)
          .font('Helvetica')
          .text(data.invoiceNumber, 180, y);

        y += 18;
        doc
          .font('Helvetica-Bold')
          .text('Date:', 50, y)
          .font('Helvetica')
          .text(data.date, 180, y);

        y += 18;
        doc
          .font('Helvetica-Bold')
          .text('Order ID:', 50, y)
          .font('Helvetica')
          .fontSize(9)
          .text(data.razorpayOrderId, 180, y);

        if (data.razorpayPaymentId) {
          y += 18;
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Payment ID:', 50, y)
            .font('Helvetica')
            .fontSize(9)
            .text(data.razorpayPaymentId, 180, y);
        }

        // ─── Divider ────────────────────────────────────────────────
        y += 30;
        doc
          .moveTo(50, y)
          .lineTo(doc.page.width - 50, y)
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .stroke();

        // ─── Bill To ────────────────────────────────────────────────
        y += 15;
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(primaryColor)
          .text('BILL TO', 50, y);

        y += 20;
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(darkColor)
          .text(data.parentName, 50, y);

        y += 15;
        doc.fillColor(mutedColor).text(data.email, 50, y);

        y += 15;
        doc.text(data.phone, 50, y);

        y += 15;
        doc.text(`Registration: ${data.registrationId}`, 50, y);

        y += 15;
        doc.text(`Child: ${data.childName}`, 50, y);

        // ─── Item Table ─────────────────────────────────────────────
        y += 35;

        // Table header background
        doc
          .rect(50, y, doc.page.width - 100, 28)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#ffffff')
          .text('Description', 60, y + 8)
          .text('Amount', doc.page.width - 160, y + 8, { width: 100, align: 'right' });

        // Table body
        y += 28;

        // Row 1: Base price
        const basePrice = Math.round((data.amount / 1.18) * 100) / 100;
        const planName = data.subscriptionPlan === 'ANNUAL' ? 'Annual Plan (1 Year)' : '5-Year Plan';
        const description = `WombTo18 ${planName} — Child Healthcare Subscription`;
        
        doc
          .rect(50, y, doc.page.width - 100, 30)
          .fill(lightBg);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(darkColor)
          .text(description, 60, y + 9)
          .text(`₹${basePrice.toFixed(2)}`, doc.page.width - 160, y + 9, { width: 100, align: 'right' });

        y += 30;

        // Row 2: GST
        const gst = Math.round((data.amount - basePrice) * 100) / 100;
        doc
          .rect(50, y, doc.page.width - 100, 30)
          .fill('#ffffff');

        doc
          .text('GST @ 18%', 60, y + 9)
          .text(`₹${gst.toFixed(2)}`, doc.page.width - 160, y + 9, { width: 100, align: 'right' });

        y += 30;

        // Total row
        doc
          .rect(50, y, doc.page.width - 100, 35)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('#ffffff')
          .text('Total', 60, y + 10)
          .text(`₹${data.amount.toFixed(2)}`, doc.page.width - 160, y + 10, { width: 100, align: 'right' });

        // ─── Payment Method ─────────────────────────────────────────
        y += 55;
        if (data.paymentMethod) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor(mutedColor)
            .text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 50, y);
          y += 18;
        }

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#22c55e')
          .text('✓ Payment Received — Thank you!', 50, y);

        // ─── Footer ─────────────────────────────────────────────────
        const footerY = doc.page.height - 80;

        doc
          .moveTo(50, footerY)
          .lineTo(doc.page.width - 50, footerY)
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(mutedColor)
          .text(
            'This is a computer-generated invoice and does not require a signature.',
            50,
            footerY + 12,
            { align: 'center', width: doc.page.width - 100 },
          )
          .text(
            'WombTo18 — Maternal-to-Child Health Platform | support@wombto18.com',
            50,
            footerY + 25,
            { align: 'center', width: doc.page.width - 100 },
          );

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate invoice PDF', err);
        reject(err);
      }
    });
  }
}
