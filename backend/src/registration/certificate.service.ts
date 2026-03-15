import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

export interface CertificateData {
  childName: string;
  motherName: string;
  registrationId: string;
  dateOfBirth: string;
  state: string;
  issuedDate: string;
}

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  async generateGoGreenCertificate(data: CertificateData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 0, layout: 'landscape' });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const W = doc.page.width;   // 841
        const H = doc.page.height;  // 595
        const green = '#16a34a';
        const darkGreen = '#14532d';
        const lightGreen = '#dcfce7';
        const gold = '#ca8a04';

        // ─── Background ──────────────────────────────────────────────
        doc.rect(0, 0, W, H).fill('#f0fdf4');

        // Outer border
        doc.rect(20, 20, W - 40, H - 40).lineWidth(3).strokeColor(green).stroke();
        // Inner border
        doc.rect(28, 28, W - 56, H - 56).lineWidth(1).strokeColor('#86efac').stroke();

        // ─── Header band ─────────────────────────────────────────────
        doc.rect(0, 0, W, 110).fill(green);

        // Logo text
        doc.font('Helvetica-Bold').fontSize(32).fillColor('#ffffff').text('WombTo18', 50, 30);
        doc.font('Helvetica').fontSize(11).fillColor('#bbf7d0').text('Maternal-to-Child Health Platform', 50, 68);

        // Certificate title on right
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff')
          .text('GO GREEN PARTICIPATION', W - 320, 32, { width: 270, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#fef08a')
          .text('CERTIFICATE', W - 320, 52, { width: 270, align: 'right' });

        // ─── Leaf decoration ─────────────────────────────────────────
        doc.font('Helvetica').fontSize(60).fillColor('#86efac').text('🌱', W / 2 - 30, 120);

        // ─── Body ────────────────────────────────────────────────────
        let y = 195;

        doc.font('Helvetica').fontSize(14).fillColor('#166534')
          .text('This is to certify that', 0, y, { align: 'center', width: W });

        y += 35;
        doc.font('Helvetica-Bold').fontSize(30).fillColor(darkGreen)
          .text(data.childName, 0, y, { align: 'center', width: W });

        y += 42;
        doc.font('Helvetica').fontSize(13).fillColor('#166534')
          .text(`Child of ${data.motherName}`, 0, y, { align: 'center', width: W });

        y += 30;
        doc.font('Helvetica').fontSize(12).fillColor('#4b5563')
          .text(`Registration ID: ${data.registrationId}  |  State: ${data.state}`, 0, y, { align: 'center', width: W });

        y += 40;

        // Green cohort message box
        doc.rect(W / 2 - 260, y, 520, 52).fill(lightGreen).stroke('#86efac');
        doc.font('Helvetica').fontSize(12).fillColor(darkGreen)
          .text(
            'has been enrolled in the WombTo18 Green Cohort and a tree has been\nplanted in their name as part of our environmental initiative.',
            W / 2 - 250, y + 8,
            { width: 500, align: 'center' },
          );

        y += 75;

        // ─── Footer ──────────────────────────────────────────────────
        doc.moveTo(60, y).lineTo(W - 60, y).strokeColor('#86efac').lineWidth(1).stroke();

        y += 14;
        doc.font('Helvetica').fontSize(10).fillColor('#6b7280')
          .text(`Issued on: ${data.issuedDate}`, 60, y)
          .text('WombTo18 — Committed to a Greener Future', 0, y, { align: 'center', width: W })
          .text('support@wombto18.com', W - 260, y, { width: 200, align: 'right' });

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate Go Green certificate', err);
        reject(err);
      }
    });
  }
}
