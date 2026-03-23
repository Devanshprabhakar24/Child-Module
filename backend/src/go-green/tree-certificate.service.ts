import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

interface TreeCertificateData {
  childName: string;
  motherName: string;
  treeId: string;
  species: string;
  plantedDate: Date;
  registrationId: string;
  tier: string;
  co2Offset: number;
}

@Injectable()
export class TreeCertificateService {
  private readonly logger = new Logger(TreeCertificateService.name);
  
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  
  // Tree background image - you can replace this with your actual image URL or local path
  private readonly treeImagePath = path.join(__dirname, 'assets', 'tree-background.jpg');

  /**
   * Download image from URL to buffer
   */
  private async downloadImage(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      protocol.get(url, (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
  }

  async generateTreeCertificate(data: TreeCertificateData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'portrait',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Colors
        const darkGreen = '#1a5f3f';
        const lightGreen = '#4ade80';
        const gold = '#d4af37';
        const textColor = '#1f2937';

        // Header - Green background with tree image overlay
        doc.rect(0, 0, 595, 180).fill(darkGreen);
        
        // Add subtle tree pattern overlay (if image exists)
        try {
          if (fs.existsSync(this.treeImagePath)) {
            doc.save();
            doc.opacity(0.15);
            doc.image(this.treeImagePath, 0, 0, {
              width: 595,
              height: 180,
            });
            doc.restore();
          }
        } catch (err) {
          this.logger.warn('Tree background image not found, using solid color');
        }

        // Logo/Icon area - circular white badge with tree/plant icon
        const centerX = 297.5;
        const centerY = 70;
        const radius = 45;
        
        // White circle background
        doc.circle(centerX, centerY, radius).fill('#ffffff');
        
        // Draw plant/sapling icon using simple shapes
        doc.save();
        doc.translate(centerX, centerY);
        
        // Draw stylized plant/sapling
        doc.fillColor(darkGreen);
        
        // Stem
        doc.rect(-2, -5, 4, 25).fill(darkGreen);
        
        // Leaves (left side)
        doc.moveTo(-2, 0)
           .bezierCurveTo(-15, -5, -18, -10, -12, -15)
           .bezierCurveTo(-8, -12, -5, -8, -2, -5)
           .fill(darkGreen);
        
        // Leaves (right side)
        doc.moveTo(2, 5)
           .bezierCurveTo(15, 0, 18, -5, 12, -10)
           .bezierCurveTo(8, -7, 5, -3, 2, 0)
           .fill(darkGreen);
        
        // Small leaves on top
        doc.circle(-5, -10, 4).fill(darkGreen);
        doc.circle(5, -12, 4).fill(darkGreen);
        doc.circle(0, -15, 5).fill(darkGreen);
        
        doc.restore();

        // Brand name - WOMBTO18™
        doc.fontSize(36)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text('WOMBTO18™', 0, 125, { align: 'center' });

        // Subtitle - GO GREEN INITIATIVE
        doc.fontSize(13)
          .fillColor(lightGreen)
          .font('Helvetica')
          .text('GO GREEN INITIATIVE', 0, 165, { align: 'center' });

        // Certificate Title
        doc.moveDown(3);
        doc.fontSize(36)
          .fillColor(darkGreen)
          .font('Helvetica-Bold')
          .text('CERTIFICATE', { align: 'center' });

        doc.fontSize(14)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text('OF COMMITMENT', { align: 'center' });

        // Main content
        doc.moveDown(2);
        doc.fontSize(11)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text('This certificate is proudly presented to', { align: 'center' });

        // Child Name - Large and prominent
        doc.moveDown(1.5);
        doc.fontSize(28)
          .fillColor(darkGreen)
          .font('Helvetica-Bold')
          .text(data.childName.toUpperCase(), { align: 'center' });

        // Underline
        const nameWidth = doc.widthOfString(data.childName.toUpperCase());
        const nameX = (595 - nameWidth) / 2;
        const nameY = doc.y;
        doc.moveTo(nameX, nameY + 5)
          .lineTo(nameX + nameWidth, nameY + 5)
          .stroke(gold);

        // Recognition text - formatted paragraph with proper spacing
        doc.moveDown(2.5);
        const leftMargin = 80;
        const rightMargin = 515;
        const textWidth = rightMargin - leftMargin;
        
        doc.fontSize(10.5)
          .fillColor(textColor)
          .font('Helvetica');

        const recognitionText = 'In recognition of the ';
        doc.text(recognitionText, leftMargin, doc.y, { 
          width: textWidth, 
          align: 'left',
          continued: true 
        });

        doc.font('Helvetica-Bold').text('valuable contribution', { continued: true });
        doc.font('Helvetica').text(' towards nurturing a ', { continued: true });
        doc.font('Helvetica-Bold').text('healthier and more sustainable planet', { continued: true });
        doc.font('Helvetica').text(' through the ', { continued: true });
        doc.font('Helvetica-Bold').fillColor(darkGreen).text('WOMBTO18 Go Green Initiative', { continued: true });
        doc.font('Helvetica').fillColor(textColor).text(' — where every registration supports the planting of a ', { continued: true });
        doc.font('Helvetica-Bold').text('sapling', { continued: true });
        doc.font('Helvetica').text(' for a greener tomorrow.');

        doc.moveDown(1.2);
        doc.text('Thank you for being an integral part of this collective commitment.', leftMargin, doc.y, {
          width: textWidth,
          align: 'left'
        });

        // Tree Details Box - matching the design
        doc.moveDown(2);
        const boxY = doc.y;
        const boxHeight = 75;
        doc.rect(100, boxY, 395, boxHeight)
          .fillAndStroke('#f0fdf4', '#10b981');

        doc.fontSize(9.5)
          .fillColor(textColor)
          .font('Helvetica');

        // Tree details in grid layout
        const col1X = 120;
        const col2X = 320;
        let detailY = boxY + 15;

        // Row 1
        doc.text('Tree ID:', col1X, detailY);
        doc.font('Helvetica-Bold').text(data.treeId, col1X + 100, detailY);

        doc.font('Helvetica').text('Species:', col2X, detailY);
        doc.font('Helvetica-Bold').text(data.species, col2X + 60, detailY);

        // Row 2
        detailY += 20;
        doc.font('Helvetica').text('Planted Date:', col1X, detailY);
        doc.font('Helvetica-Bold').text(
          new Date(data.plantedDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          col1X + 100,
          detailY
        );

        doc.font('Helvetica').text('CO₂ Offset:', col2X, detailY);
        doc.font('Helvetica-Bold').text(`${data.co2Offset} kg/year`, col2X + 60, detailY);

        // Row 3
        detailY += 20;
        doc.font('Helvetica').text('Tier:', col1X, detailY);
        doc.font('Helvetica-Bold').text(data.tier, col1X + 100, detailY);

        // Signature section
        doc.moveDown(3.5);
        const sigY = doc.y;

        // Left: Founder signature
        doc.fontSize(18)
          .font('Helvetica-BoldOblique')
          .fillColor(darkGreen)
          .text('Sowjanya', 100, sigY);

        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text('Sowjanya Reddy', 100, sigY + 28);

        doc.fontSize(8.5)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text('FOUNDER', 100, sigY + 43);

        // Center: Seal/Badge - circular with plant/tree icon
        const sealX = 297.5;
        const sealY = sigY + 25;
        const sealRadius = 35;
        
        // Double circle border in gold
        doc.lineWidth(2);
        doc.circle(sealX, sealY, sealRadius).stroke(gold);
        doc.circle(sealX, sealY, sealRadius - 3).stroke(gold);
        
        // Draw tree/plant icon in center
        doc.save();
        doc.translate(sealX, sealY);
        
        // Simple tree silhouette in gold
        doc.fillColor(gold);
        
        // Tree trunk
        doc.rect(-2, 5, 4, 15).fill(gold);
        
        // Tree crown (foliage)
        doc.circle(0, -5, 12).fill(gold);
        doc.circle(-8, 0, 8).fill(gold);
        doc.circle(8, 0, 8).fill(gold);
        doc.circle(-5, -10, 6).fill(gold);
        doc.circle(5, -10, 6).fill(gold);
        
        doc.restore();

        // Right: Date
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text('Date', 450, sigY + 15);

        doc.fontSize(9)
          .font('Helvetica')
          .fillColor('#6b7280')
          .text(
            new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            420,
            sigY + 30
          );

        // Footer
        doc.fontSize(8)
          .fillColor('#6b7280')
          .font('Helvetica')
          .text(
            `Registration ID: ${data.registrationId} | Certificate ID: ${data.treeId}`,
            0,
            750,
            { align: 'center' }
          );

        doc.text('WombTo18 Health Platform | www.wombto18.com', 0, 765, {
          align: 'center',
        });

        // Decorative border
        doc.rect(30, 30, 535, 782).stroke(gold);
        doc.rect(35, 35, 525, 772).stroke(gold);

        doc.end();
      } catch (err) {
        this.logger.error('Failed to generate tree certificate', err);
        reject(err);
      }
    });
  }

  /**
   * Generate tree certificate and upload to Cloudinary
   */
  async generateAndUploadTreeCertificate(data: TreeCertificateData): Promise<{ buffer: Buffer; cloudinaryUrl: string }> {
    const buffer = await this.generateTreeCertificate(data);
    
    // Try to upload to Cloudinary if configured
    let cloudinaryUrl = '';
    try {
      if (this.cloudinaryService.isConfigured()) {
        const cloudinaryResult = await this.cloudinaryService.uploadTreeCertificatePDF(
          buffer,
          data.treeId,
          data.registrationId
        );
        cloudinaryUrl = cloudinaryResult.url;
        this.logger.log(`Tree certificate uploaded to Cloudinary: ${cloudinaryUrl}`);
      } else {
        this.logger.warn('Cloudinary not configured, tree certificate will not be stored in cloud');
      }
    } catch (error) {
      this.logger.error(`Failed to upload tree certificate to Cloudinary: ${error instanceof Error ? error.message : error}`);
    }

    return {
      buffer,
      cloudinaryUrl,
    };
  }
}
