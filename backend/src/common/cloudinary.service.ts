import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor(private readonly configService: ConfigService) {
    this.ensureConfigured();
  }

  private ensureConfigured() {
    if (!this.configured) {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        this.logger.warn(
          `Cloudinary configuration missing. File uploads will be skipped. Found: cloud_name=${cloudName ? 'yes' : 'no'}, api_key=${apiKey ? 'yes' : 'no'}, api_secret=${apiSecret ? 'yes' : 'no'}`
        );
        this.configured = false;
        return;
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      this.configured = true;
      this.logger.log('✅ Cloudinary configured successfully');
    }
  }

  /**
   * Check if Cloudinary is configured
   */
  isConfigured(): boolean {
    this.ensureConfigured();
    return this.configured;
  }

  /**
   * Upload file buffer to Cloudinary
   * Supports images and PDFs
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: {
      folder?: string;
      resourceType?: 'image' | 'raw' | 'video' | 'auto';
      publicId?: string;
      tags?: string[];
    }
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options?.folder || 'wombto18',
        resource_type: options?.resourceType || 'auto',
        public_id: options?.publicId,
        tags: options?.tags || [],
        // For PDFs and documents
        format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions as any,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`);
            return reject(error);
          }
          if (result) {
            this.logger.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload PDF buffer to Cloudinary
   * Used for generated PDFs (invoices, certificates, vaccination cards)
   */
  async uploadPDFBuffer(
    pdfBuffer: Buffer,
    options: {
      folder: string;
      publicId: string;
      tags?: string[];
    }
  ): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured()) {
      this.logger.warn('Cloudinary not configured, skipping PDF upload');
      return { url: '', publicId: '' };
    }

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder,
        resource_type: 'raw' as const,
        public_id: options.publicId,
        tags: options.tags || [],
        format: 'pdf',
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary PDF upload error: ${error.message}`);
            return reject(error);
          }
          if (result) {
            this.logger.log(`✅ PDF uploaded to Cloudinary: ${result.secure_url}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });
  }

  /**
   * Upload profile picture (image only)
   */
  async uploadProfilePicture(
    file: Express.Multer.File,
    registrationId: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      this.logger.warn('Cloudinary not configured, skipping profile picture upload');
      return '';
    }

    const result = await this.uploadFile(file, {
      folder: 'wombto18/profile-pictures',
      resourceType: 'image',
      publicId: `profile_${registrationId}_${Date.now()}`,
      tags: ['profile-picture', registrationId],
    });

    return result.secure_url;
  }

  /**
   * Upload health record (PDF or image)
   */
  async uploadHealthRecord(
    file: Express.Multer.File,
    registrationId: string,
    category: string
  ): Promise<{ url: string; publicId: string; format: string }> {
    if (!this.isConfigured()) {
      this.logger.warn('Cloudinary not configured, skipping health record upload');
      return { url: '', publicId: '', format: '' };
    }

    const result = await this.uploadFile(file, {
      folder: `wombto18/health-records/${registrationId}`,
      resourceType: 'auto',
      publicId: `${category}_${Date.now()}`,
      tags: ['health-record', registrationId, category],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    };
  }

  /**
   * Upload vaccination card (PDF or image)
   */
  async uploadVaccinationCard(
    file: Express.Multer.File,
    registrationId: string,
    vaccineName: string
  ): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured()) {
      this.logger.warn('Cloudinary not configured, skipping vaccination card upload');
      return { url: '', publicId: '' };
    }

    const result = await this.uploadFile(file, {
      folder: `wombto18/vaccination-cards/${registrationId}`,
      resourceType: 'auto',
      publicId: `${vaccineName}_${Date.now()}`,
      tags: ['vaccination-card', registrationId, vaccineName],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      this.logger.log(`✅ File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from Cloudinary: ${publicId}`, error);
      throw error;
    }
  }

  /**
   * Get file URL from public ID
   */
  getFileUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...options,
    });
  }

  /**
   * Upload vaccination card PDF
   */
  async uploadVaccinationCardPDF(
    pdfBuffer: Buffer,
    registrationId: string
  ): Promise<{ url: string; publicId: string }> {
    return this.uploadPDFBuffer(pdfBuffer, {
      folder: `wombto18/vaccination-cards/${registrationId}`,
      publicId: `vaccination_card_${registrationId}_${Date.now()}`,
      tags: ['vaccination-card', registrationId],
    });
  }

  /**
   * Upload invoice PDF
   */
  async uploadInvoicePDF(
    pdfBuffer: Buffer,
    registrationId: string
  ): Promise<{ url: string; publicId: string }> {
    return this.uploadPDFBuffer(pdfBuffer, {
      folder: `wombto18/invoices/${registrationId}`,
      publicId: `invoice_${registrationId}_${Date.now()}`,
      tags: ['invoice', registrationId],
    });
  }

  /**
   * Upload Go Green certificate PDF
   */
  async uploadGoGreenCertificatePDF(
    pdfBuffer: Buffer,
    registrationId: string,
    treeId?: string
  ): Promise<{ url: string; publicId: string }> {
    return this.uploadPDFBuffer(pdfBuffer, {
      folder: `wombto18/certificates/${registrationId}`,
      publicId: `certificate_${registrationId}_${treeId || Date.now()}`,
      tags: ['certificate', 'go-green', registrationId],
    });
  }

  /**
   * Upload tree certificate PDF
   */
  async uploadTreeCertificatePDF(
    pdfBuffer: Buffer,
    treeId: string,
    registrationId: string
  ): Promise<{ url: string; publicId: string }> {
    return this.uploadPDFBuffer(pdfBuffer, {
      folder: `wombto18/tree-certificates/${registrationId}`,
      publicId: `tree_${treeId}_${Date.now()}`,
      tags: ['tree-certificate', registrationId, treeId],
    });
  }
}
