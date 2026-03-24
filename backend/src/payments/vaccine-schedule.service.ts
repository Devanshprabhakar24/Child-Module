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
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 30,
          bufferPages: true // Enable page buffering to prevent premature page breaks
        });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const primaryColor = '#1e40af'; // Professional blue
        const darkColor = '#1e293b';
        const mutedColor = '#64748b';
        const completedColor = '#059669'; // Green
        const upcomingColor = '#0284c7'; // Blue
        const dueColor = '#dc2626'; // Red

        // ─── Header with Logo Area ──────────────────────────────────────
        doc
          .rect(0, 0, doc.page.width, 80)
          .fill(primaryColor);

        // Organization Name
        doc
          .font('Helvetica-Bold')
          .fontSize(24)
          .fillColor('#ffffff')
          .text('VACCINATION RECORD', 30, 20, { align: 'center' });

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#dbeafe')
          .text('WombTo18 Maternal & Child Health Platform', 30, 50, { align: 'center' });

        // ─── Child Information Card ─────────────────────────────────────
        let y = 95;

        // Card border
        doc
          .rect(30, y, doc.page.width - 60, 110)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        y += 12;

        // Title
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(primaryColor)
          .text('PATIENT INFORMATION', 40, y);

        y += 20;

        // Two-column layout for patient info
        const leftCol = 40;
        const rightCol = 310;
        const lineHeight = 18;

        doc.font('Helvetica-Bold').fontSize(9).fillColor(darkColor);
        doc.text('Patient Name:', leftCol, y);
        doc.font('Helvetica').fillColor(mutedColor);
        doc.text(data.childName.toUpperCase(), leftCol + 85, y);

        doc.font('Helvetica-Bold').fillColor(darkColor);
        doc.text('Date of Birth:', rightCol, y);
        doc.font('Helvetica').fillColor(mutedColor);
        doc.text(data.dateOfBirth, rightCol + 75, y);

        y += lineHeight;

        doc.font('Helvetica-Bold').fillColor(darkColor);
        doc.text('Parent/Guardian:', leftCol, y);
        doc.font('Helvetica').fillColor(mutedColor);
        doc.text(data.parentName, leftCol + 85, y);

        doc.font('Helvetica-Bold').fillColor(darkColor);
        doc.text('Record ID:', rightCol, y);
        doc.font('Helvetica').fillColor(mutedColor);
        doc.text(data.registrationId, rightCol + 75, y);

        y += lineHeight;

        doc.font('Helvetica-Bold').fillColor(darkColor);
        doc.text('Total Vaccines:', leftCol, y);
        doc.font('Helvetica').fillColor(mutedColor);
        doc.text(data.vaccines.length.toString(), leftCol + 85, y);

        // Statistics
        const completed = data.vaccines.filter(v => v.status === 'completed').length;
        const upcoming = data.vaccines.filter(v => v.status === 'upcoming').length;
        const due = data.vaccines.filter(v => v.status === 'due').length;

        doc.font('Helvetica-Bold').fillColor(darkColor);
        doc.text('Status:', rightCol, y);
        doc.font('Helvetica').fillColor(completedColor);
        doc.text(`${completed} Completed`, rightCol + 75, y);

        y += lineHeight;

        doc.font('Helvetica').fillColor(upcomingColor);
        doc.text(`${upcoming} Upcoming`, rightCol + 75, y);
        doc.fillColor(dueColor);
        doc.text(`${due} Overdue`, rightCol + 155, y);

        // ─── Vaccination Schedule Table ─────────────────────────────────
        y += 25;

        // Table header
        doc
          .rect(30, y, doc.page.width - 60, 25)
          .fill(primaryColor);

        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#ffffff')
          .text('VACCINE NAME', 38, y + 8, { width: 180 })
          .text('AGE GROUP', 230, y + 8, { width: 70 })
          .text('DUE DATE', 310, y + 8, { width: 90 })
          .text('STATUS', 410, y + 8, { width: 70 });

        y += 25;

        // Table rows
        let rowIndex = 0;
        const rowHeight = 20;
        const pageBottomMargin = 100; // Space for footer and notes
        
        for (const vaccine of data.vaccines) {
          // Check if we need a new page (leave space for footer)
          if (y > doc.page.height - pageBottomMargin) {
            doc.addPage();
            y = 30;

            // Repeat header on new page
            doc
              .rect(30, y, doc.page.width - 60, 25)
              .fill(primaryColor);

            doc
              .font('Helvetica-Bold')
              .fontSize(8)
              .fillColor('#ffffff')
              .text('VACCINE NAME', 38, y + 8, { width: 180 })
              .text('AGE GROUP', 230, y + 8, { width: 70 })
              .text('DUE DATE', 310, y + 8, { width: 90 })
              .text('STATUS', 410, y + 8, { width: 70 });

            y += 25;
            rowIndex = 0;
          }

          // Alternate row colors
          const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc
            .rect(30, y, doc.page.width - 60, rowHeight)
            .fill(bgColor);

          // Draw subtle border
          doc
            .rect(30, y, doc.page.width - 60, rowHeight)
            .stroke('#e2e8f0');

          // Status indicator and text
          let statusText = '';
          let statusColor = mutedColor;
          
          if (vaccine.status === 'completed') {
            statusText = 'COMPLETED';
            statusColor = completedColor;
          } else if (vaccine.status === 'due') {
            statusText = 'OVERDUE';
            statusColor = dueColor;
          } else {
            statusText = 'SCHEDULED';
            statusColor = upcomingColor;
          }

          // Vaccine name (bold)
          doc
            .font('Helvetica-Bold')
            .fontSize(8)
            .fillColor(darkColor)
            .text(vaccine.name, 38, y + 6, { width: 180, ellipsis: true });

          // Age group
          doc
            .font('Helvetica')
            .fontSize(7)
            .fillColor(mutedColor)
            .text(vaccine.ageGroup, 230, y + 6, { width: 70 });

          // Due date
          doc
            .font('Helvetica')
            .fontSize(7)
            .fillColor(mutedColor)
            .text(vaccine.dueDate, 310, y + 6, { width: 90 });

          // Status
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor(statusColor)
            .text(statusText, 410, y + 6, { width: 70 });

          y += rowHeight;
          rowIndex++;
        }

        // ─── Important Notes Section ────────────────────────────────────
        y += 12;
        if (y > doc.page.height - 120) {
          doc.addPage();
          y = 30;
        }

        doc
          .rect(30, y, doc.page.width - 60, 75)
          .fillAndStroke('#fef3c7', '#f59e0b');

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#92400e')
          .text('IMPORTANT NOTES', 38, y + 10);

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#78350f')
          .text(
            '• This vaccination record is generated by WombTo18 Health Platform and should be maintained for medical reference.',
            38,
            y + 25,
            { width: doc.page.width - 76, align: 'left' }
          )
          .text(
            '• Automated reminders will be sent 2 days before each scheduled vaccination date.',
            38,
            y + 38,
            { width: doc.page.width - 76, align: 'left' }
          )
          .text(
            '• Please consult with your healthcare provider for any questions regarding the vaccination schedule.',
            38,
            y + 51,
            { width: doc.page.width - 76, align: 'left' }
          );

        // ─── Footer with Official Information ───────────────────────────
        const footerY = doc.page.height - 60;

        doc
          .moveTo(30, footerY)
          .lineTo(doc.page.width - 30, footerY)
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(darkColor)
          .text(
            'WombTo18 - Maternal & Child Health Platform',
            30,
            footerY + 10,
            { align: 'center', width: doc.page.width - 60 }
          );

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor(mutedColor)
          .text(
            'Email: support@wombto18.com | Website: www.wombto18.com',
            30,
            footerY + 23,
            { align: 'center', width: doc.page.width - 60 }
          );

        doc
          .fontSize(6)
          .fillColor(mutedColor)
          .text(
            `Document generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            30,
            footerY + 35,
            { align: 'center', width: doc.page.width - 60 }
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
