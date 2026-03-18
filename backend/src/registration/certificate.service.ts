import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

export interface CertificateData {
  childName: string;
  motherName: string;
  registrationId: string;
  dateOfBirth: string;
  state: string;
  issuedDate: string;
  treeId?: string;
}

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);

  async generateGoGreenCertificate(data: CertificateData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 0, 
          layout: 'landscape',
          info: {
            Title: `Go Green Certificate - ${data.childName}`,
            Author: 'WombTo18 Health Platform',
            Subject: 'Go Green Participation Certificate',
            Creator: 'WombTo18 Certificate Generator'
          }
        });
        const chunks: Uint8Array[] = [];

        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const W = doc.page.width;   // 841
        const H = doc.page.height;  // 595
        
        // Color palette
        const colors = {
          primary: '#16a34a',
          secondary: '#22c55e',
          accent: '#84cc16',
          gold: '#eab308',
          darkGreen: '#14532d',
          lightGreen: '#dcfce7',
          cream: '#fefce8',
          white: '#ffffff',
          gray: '#6b7280',
          darkGray: '#374151'
        };

        // ═══════════════════════════════════════════════════════════════
        // BACKGROUND & BORDERS
        // ═══════════════════════════════════════════════════════════════
        
        // Main background
        doc.rect(0, 0, W, H).fill(colors.cream);
        
        // Decorative border pattern
        doc.rect(15, 15, W - 30, H - 30)
           .lineWidth(4)
           .strokeColor(colors.primary)
           .stroke();
           
        doc.rect(25, 25, W - 50, H - 50)
           .lineWidth(2)
           .strokeColor(colors.secondary)
           .stroke();
           
        doc.rect(35, 35, W - 70, H - 70)
           .lineWidth(1)
           .strokeColor(colors.accent)
           .stroke();

        // Corner decorations - using geometric shapes instead of emojis
        const cornerSize = 40;
        [
          [45, 45], [W - 85, 45], [45, H - 85], [W - 85, H - 85]
        ].forEach(([x, y]) => {
          doc.rect(x, y, cornerSize, cornerSize)
             .fill(colors.lightGreen)
             .stroke();
          doc.circle(x + cornerSize/2, y + cornerSize/2, 8)
             .fill(colors.primary);
          // Add small decorative diamond
          doc.polygon([x + cornerSize/2, y + cornerSize/2 - 4], 
                     [x + cornerSize/2 + 4, y + cornerSize/2], 
                     [x + cornerSize/2, y + cornerSize/2 + 4], 
                     [x + cornerSize/2 - 4, y + cornerSize/2])
             .fill(colors.white);
        });

        // ═══════════════════════════════════════════════════════════════
        // HEADER SECTION
        // ═══════════════════════════════════════════════════════════════
        
        let y = 70;
        
        // Logo area (left) - Using text instead of emoji
        doc.circle(120, y + 25, 25).fill(colors.primary);
        doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.white)
           .text('TREE', 105, y + 18);
        
        // Main title (center)
        doc.font('Helvetica-Bold').fontSize(36).fillColor(colors.primary)
           .text('WombTo18', 0, y, { align: 'center', width: W });
           
        y += 45;
        doc.font('Helvetica').fontSize(14).fillColor(colors.darkGreen)
           .text('Maternal-to-Child Health Platform', 0, y, { align: 'center', width: W });
        
        // Certificate type (right)
        doc.rect(W - 200, 70, 150, 60)
           .fill(colors.primary)
           .stroke();
        doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.white)
           .text('GO GREEN', W - 190, 85, { width: 130, align: 'center' });
        doc.fontSize(16)
           .text('PARTICIPATION', W - 190, 100, { width: 130, align: 'center' });
        doc.fontSize(14)
           .text('CERTIFICATE', W - 190, 120, { width: 130, align: 'center' });

        // ═══════════════════════════════════════════════════════════════
        // CERTIFICATE CONTENT
        // ═══════════════════════════════════════════════════════════════
        
        y = 170;
        
        // Certificate number and date (top right)
        doc.font('Helvetica').fontSize(10).fillColor(colors.gray)
           .text(`Certificate No: GGC-${data.registrationId}`, W - 250, y)
           .text(`Issue Date: ${data.issuedDate}`, W - 250, y + 15);
        
        // Add a small seal/stamp graphic
        doc.circle(W - 100, y + 30, 20)
           .fill(colors.primary)
           .stroke();
        doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.white)
           .text('OFFICIAL', W - 115, y + 25)
           .text('SEAL', W - 110, y + 35);
        
        y += 50;
        
        // Main certification text
        doc.font('Helvetica').fontSize(18).fillColor(colors.darkGray)
           .text('This is to certify that', 0, y, { align: 'center', width: W });
        
        y += 40;
        
        // Child name (prominent)
        doc.font('Helvetica-Bold').fontSize(42).fillColor(colors.primary)
           .text(data.childName, 0, y, { align: 'center', width: W });
        
        y += 55;
        
        // Parent information
        doc.font('Helvetica-Oblique').fontSize(16).fillColor(colors.darkGreen)
           .text(`Child of ${data.motherName}`, 0, y, { align: 'center', width: W });
        
        y += 35;
        
        // Registration details box
        const detailsBoxX = W/2 - 200;
        const detailsBoxY = y;
        const detailsBoxW = 400;
        const detailsBoxH = 95; // Increased height for tree ID
        
        doc.rect(detailsBoxX, detailsBoxY, detailsBoxW, detailsBoxH)
           .fill(colors.lightGreen)
           .strokeColor(colors.secondary)
           .lineWidth(2)
           .stroke();
        
        // Registration details content
        doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.darkGreen)
           .text('REGISTRATION DETAILS', detailsBoxX + 20, detailsBoxY + 15);
        
        const detailsY = detailsBoxY + 35;
        doc.font('Helvetica').fontSize(11).fillColor(colors.darkGray);
        
        // Left column
        doc.text('Registration ID:', detailsBoxX + 20, detailsY)
           .text('Date of Birth:', detailsBoxX + 20, detailsY + 15)
           .text('State:', detailsBoxX + 20, detailsY + 30)
           .text('Tree ID:', detailsBoxX + 20, detailsY + 45);
        
        // Right column
        doc.font('Helvetica-Bold')
           .text(data.registrationId, detailsBoxX + 120, detailsY)
           .text(new Date(data.dateOfBirth).toLocaleDateString('en-IN'), detailsBoxX + 120, detailsY + 15)
           .text(data.state, detailsBoxX + 120, detailsY + 30)
           .text(data.treeId || 'TREE-PENDING-001', detailsBoxX + 120, detailsY + 45);
        
        // Age calculation and display
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        const ageText = years > 0 ? `${years}y ${months}m` : `${months} months`;
        
        doc.font('Helvetica').fontSize(11)
           .text('Age:', detailsBoxX + 250, detailsY)
           .font('Helvetica-Bold')
           .text(ageText, detailsBoxX + 280, detailsY);
        
        y += 125;
        
        // Environmental message
        const messageBoxX = W/2 - 250;
        const messageBoxY = y;
        const messageBoxW = 500;
        const messageBoxH = 60;
        
        doc.rect(messageBoxX, messageBoxY, messageBoxW, messageBoxH)
           .fill(colors.primary)
           .stroke();
        
        doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.white)
           .text('*** ENVIRONMENTAL COMMITMENT ***', 0, messageBoxY + 12, { align: 'center', width: W });
        
        doc.font('Helvetica').fontSize(12)
           .text('has been enrolled in the WombTo18 Green Cohort and a tree has been', 0, messageBoxY + 32, { align: 'center', width: W })
           .text('planted in their name as part of our environmental sustainability initiative.', 0, messageBoxY + 47, { align: 'center', width: W });

        // ═══════════════════════════════════════════════════════════════
        // FOOTER SECTION
        // ═══════════════════════════════════════════════════════════════
        
        y = H - 80;
        
        // Signature line
        doc.moveTo(W/2 - 100, y).lineTo(W/2 + 100, y)
           .strokeColor(colors.gray).lineWidth(1).stroke();
        
        doc.font('Helvetica').fontSize(10).fillColor(colors.gray)
           .text('Authorized Signature', 0, y + 10, { align: 'center', width: W });
        
        // Footer information
        y += 35;
        doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.primary)
           .text('WombTo18 — Committed to a Greener Future', 0, y, { align: 'center', width: W });
        
        y += 15;
        doc.font('Helvetica').fontSize(9).fillColor(colors.gray)
           .text('Email: support@wombto18.com | Web: www.wombto18.com | Phone: +91-XXXX-XXXX-XX', 0, y, { align: 'center', width: W });

        // ═══════════════════════════════════════════════════════════════
        // DECORATIVE ELEMENTS
        // ═══════════════════════════════════════════════════════════════
        
        // Decorative leaf shapes in corners using simple graphics
        const leafSize = 20;
        
        // Top left leaf
        doc.circle(80, 140, leafSize/2).fill(colors.accent);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary)
           .text('LEAF', 70, 135);
        
        // Top right leaf
        doc.circle(W - 80, 140, leafSize/2).fill(colors.accent);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary)
           .text('TREE', W - 95, 135);
        
        // Bottom left leaf
        doc.circle(80, H - 160, leafSize/2).fill(colors.accent);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary)
           .text('ECO', 70, H - 165);
        
        // Bottom right leaf
        doc.circle(W - 80, H - 160, leafSize/2).fill(colors.accent);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.primary)
           .text('GREEN', W - 100, H - 165);
        
        // Watermark
        doc.font('Helvetica-Bold').fontSize(60).fillColor('#f0f9ff').opacity(0.1)
           .text('WOMBTO18', 0, H/2 - 30, { align: 'center', width: W });
        
        doc.opacity(1); // Reset opacity

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate Go Green certificate', err);
        reject(err);
      }
    });
  }
}
