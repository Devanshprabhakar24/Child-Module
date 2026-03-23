import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary.service';
import * as PDFDocument from 'pdfkit';

export interface VaccineScheduleData {
  childName: string;
  parentName: string;
  dateOfBirth: string;
  registrationId: string;
  vaccines: Array<{
    name: string;
    ageGroup: string;
    dueDate: string;
    status: 'completed' | 'due' | 'upcoming';
  }>;
}

@Injectable()
export class VaccineScheduleService {
  private readonly logger = new Logger(VaccineScheduleService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Generates a professional PDF vaccination schedule and returns the buffer.
   */
  async generateVaccineSchedulePDF(data: VaccineScheduleData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const primaryColor = '#2196F3';
        const darkColor = '#1e293b';
        const mutedColor = '#64748b';
        const completedColor = '#4CAF50';
        const upcomingColor = '#2196F3';

        // ─── Header ─────────────────────────────────────────────────
        doc
          .rect(0, 0, doc.page.width, 90)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(24)
          .fillColor('#ffffff')
          .text('💉 Complete Vaccination Schedule', 40, 30);

        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#dbeafe')
          .text('WombTo18 Health Platform', 40, 60);

        // ─── Child Details ──────────────────────────────────────────
        let y = 110;

        doc
          .font('Helvetica-Bold')
          .fontSize(14)
          .fillColor(primaryColor)
          .text('Child Information', 40, y);

        y += 25;

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(darkColor)
          .text('Child Name:', 40, y)
          .font('Helvetica')
          .text(data.childName, 150, y);

        y += 18;
        doc
          .font('Helvetica-Bold')
          .text('Date of Birth:', 40, y)
          .font('Helvetica')
          .text(data.dateOfBirth, 150, y);

        y += 18;
        doc
          .font('Helvetica-Bold')
          .text('Registration ID:', 40, y)
          .font('Helvetica')
          .text(data.registrationId, 150, y);

        y += 18;
        doc
          .font('Helvetica-Bold')
          .text('Total Vaccines:', 40, y)
          .font('Helvetica')
          .text(data.vaccines.length.toString(), 150, y);

        // ─── Statistics ─────────────────────────────────────────────
        const completed = data.vaccines.filter(v => v.status === 'completed').length;
        const upcoming = data.vaccines.filter(v => v.status === 'upcoming').length;
        const due = data.vaccines.filter(v => v.status === 'due').length;

        y += 25;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(completedColor)
          .text(`✅ Completed: ${completed}`, 40, y)
          .fillColor(upcomingColor)
          .text(`📅 Upcoming: ${upcoming}`, 180, y)
          .fillColor('#FF9800')
          .text(`⚠️ Due: ${due}`, 320, y);

        // ─── Divider ────────────────────────────────────────────────
        y += 20;
        doc
          .moveTo(40, y)
          .lineTo(doc.page.width - 40, y)
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .stroke();

        // ─── Vaccine Table ──────────────────────────────────────────
        y += 15;

        // Table header
        doc
          .rect(40, y, doc.page.width - 80, 25)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#ffffff')
          .text('Vaccine Name', 45, y + 8, { width: 180 })
          .text('Age Group', 230, y + 8, { width: 100 })
          .text('Due Date', 335, y + 8, { width: 120 })
          .text('Status', 460, y + 8, { width: 80 });

        y += 25;

        // Table rows
        let rowIndex = 0;
        for (const vaccine of data.vaccines) {
          // Check if we need a new page
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 40;

            // Repeat header on new page
            doc
              .rect(40, y, doc.page.width - 80, 25)
              .fill(primaryColor);

            doc
              .font('Helvetica-Bold')
              .fontSize(9)
              .fillColor('#ffffff')
              .text('Vaccine Name', 45, y + 8, { width: 180 })
              .text('Age Group', 230, y + 8, { width: 100 })
              .text('Due Date', 335, y + 8, { width: 120 })
              .text('Status', 460, y + 8, { width: 80 });

            y += 25;
            rowIndex = 0;
          }

          // Alternate row colors
          const bgColor = rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff';
          doc
            .rect(40, y, doc.page.width - 80, 22)
            .fill(bgColor);

          // Status color and icon
          let statusText = '';
          let statusColor = mutedColor;
          if (vaccine.status === 'completed') {
            statusText = '✅ Done';
            statusColor = completedColor;
          } else if (vaccine.status === 'due') {
            statusText = '⚠️ Due';
            statusColor = '#FF9800';
          } else {
            statusText = '📅 Upcoming';
            statusColor = upcomingColor;
          }

          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor(darkColor)
            .text(vaccine.name, 45, y + 7, { width: 180, ellipsis: true })
            .fillColor(mutedColor)
            .text(vaccine.ageGroup, 230, y + 7, { width: 100 })
            .text(vaccine.dueDate, 335, y + 7, { width: 120 })
            .fillColor(statusColor)
            .font('Helvetica-Bold')
            .text(statusText, 460, y + 7, { width: 80 });

          y += 22;
          rowIndex++;
        }

        // ─── Footer Note ────────────────────────────────────────────
        y += 20;
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 40;
        }

        doc
          .rect(40, y, doc.page.width - 80, 60)
          .fill('#fff3e0');

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#FF9800')
          .text('📌 Important Note:', 50, y + 12)
          .font('Helvetica')
          .fontSize(8)
          .fillColor(darkColor)
          .text(
            'You will receive automatic reminders 2 days before each vaccination is due. ' +
            'Please consult with your healthcare provider for any questions about the vaccination schedule.',
            50,
            y + 28,
            { width: doc.page.width - 100, align: 'left' }
          );

        // ─── Footer ─────────────────────────────────────────────────
        const footerY = doc.page.height - 60;

        doc
          .moveTo(40, footerY)
          .lineTo(doc.page.width - 40, footerY)
          .strokeColor('#e2e8f0')
          .lineWidth(1)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(mutedColor)
          .text(
            'This vaccination schedule is generated by WombTo18 Health Platform.',
            40,
            footerY + 12,
            { align: 'center', width: doc.page.width - 80 }
          )
          .text(
            'WombTo18 — Maternal-to-Child Health Platform | support@wombto18.com | www.wombto18.com',
            40,
            footerY + 25,
            { align: 'center', width: doc.page.width - 80 }
          );

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate vaccine schedule PDF', err);
        reject(err);
      }
    });
  }

  /**
   * Generate vaccine schedule PDF and optionally upload to Cloudinary
   */
  async generateAndUploadVaccineSchedule(data: VaccineScheduleData): Promise<{ buffer: Buffer; cloudinaryUrl: string }> {
    const buffer = await this.generateVaccineSchedulePDF(data);
    
    // Try to upload to Cloudinary if configured
    let cloudinaryUrl = '';
    try {
      if (this.cloudinaryService.isConfigured()) {
        const cloudinaryResult = await this.cloudinaryService.uploadPDFBuffer(
          buffer,
          {
            folder: `wombto18/vaccine-schedules`,
            publicId: `vaccine_schedule_${data.registrationId}_${Date.now()}`,
            tags: ['vaccine-schedule', data.registrationId],
          }
        );
        cloudinaryUrl = cloudinaryResult.url;
        this.logger.log(`Vaccine schedule uploaded to Cloudinary: ${cloudinaryUrl}`);
      } else {
        this.logger.warn('Cloudinary not configured, vaccine schedule will not be stored in cloud');
      }
    } catch (error) {
      this.logger.error(`Failed to upload vaccine schedule to Cloudinary: ${error instanceof Error ? error.message : error}`);
    }

    return {
      buffer,
      cloudinaryUrl,
    };
  }
}
