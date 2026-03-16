import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { GoGreenService } from './go-green.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TreeStatus } from './schemas/go-green-tree.schema';
import { UserRole } from '@wombto18/shared';

// Configure multer for local file storage
const goGreenStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'go-green');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const treeId = req.params.treeId || 'tree';
    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const filename = `${treeId}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

@Controller('go-green')
export class GoGreenController {
  constructor(private readonly goGreenService: GoGreenService) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck() {
    return {
      success: true,
      message: 'Go Green API is working',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Serve Go Green images
   */
  @Get('files/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'go-green', filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return res.sendFile(filePath);
  }

  /**
   * Get Go Green statistics (public)
   */
  @Get('stats')
  async getStats() {
    const stats = await this.goGreenService.getGoGreenStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get tree information by registration ID
   */
  @Get('tree/registration/:registrationId')
  async getTreeByRegistrationId(@Param('registrationId') registrationId: string) {
    const tree = await this.goGreenService.getTreeByRegistrationId(registrationId);
    if (!tree) {
      throw new NotFoundException('Tree not found for this registration');
    }
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Get tree information by tree ID
   */
  @Get('tree/:treeId')
  async getTreeByTreeId(@Param('treeId') treeId: string) {
    const tree = await this.goGreenService.getTreeByTreeId(treeId);
    if (!tree) {
      throw new NotFoundException('Tree not found');
    }
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Search trees (public)
   */
  @Get('search')
  async searchTrees(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return {
        success: false,
        message: 'Query must be at least 2 characters long',
      };
    }

    const trees = await this.goGreenService.searchTrees(query);
    return {
      success: true,
      data: trees,
    };
  }

  /**
   * Get all trees (admin only)
   */
  @Get('admin/trees')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllTrees(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    
    const result = await this.goGreenService.getAllTrees(pageNum, limitNum);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update tree status (admin only)
   */
  @Patch('admin/tree/:treeId/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTreeStatus(
    @Param('treeId') treeId: string,
    @Body() body: {
      status: TreeStatus;
      imageUrl?: string;
      notes?: string;
      updatedBy?: string;
    }
  ) {
    const tree = await this.goGreenService.updateTreeStatus(
      treeId,
      body.status,
      body.imageUrl,
      body.notes,
      body.updatedBy
    );
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Test upload endpoint (admin only)
   */
  @Post('admin/test-upload')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: goGreenStorage }))
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: file.path,
      url: `/uploads/go-green/${file.filename}`,
    };
  }

  /**
   * Upload tree image (admin only)
   */
  @Post('admin/tree/:treeId/upload-image')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: goGreenStorage }))
  async uploadTreeImage(
    @Param('treeId') treeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      notes?: string;
      updatedBy?: string;
    }
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new NotFoundException('Invalid file type. Only JPG and PNG files are allowed.');
    }

    // Create file URL for local storage
    const imageUrl = `/uploads/go-green/${file.filename}`;

    // Add growth stage with uploaded image
    const tree = await this.goGreenService.addGrowthStage(
      treeId,
      imageUrl,
      body.notes,
      body.updatedBy || 'Admin'
    );

    return {
      success: true,
      data: tree,
      imageUrl: imageUrl,
      message: 'Tree image uploaded successfully',
    };
  }

  /**
   * Add growth stage photo (admin only)
   */
  @Post('admin/tree/:treeId/growth-stage')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addGrowthStage(
    @Param('treeId') treeId: string,
    @Body() body: {
      imageUrl: string;
      notes?: string;
      updatedBy?: string;
    }
  ) {
    const tree = await this.goGreenService.addGrowthStage(
      treeId,
      body.imageUrl,
      body.notes,
      body.updatedBy
    );
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Get tree with full timeline (admin only)
   */
  @Get('admin/tree/:treeId/timeline')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTreeTimeline(@Param('treeId') treeId: string) {
    const tree = await this.goGreenService.getTreeWithTimeline(treeId);
    if (!tree) {
      throw new NotFoundException('Tree not found');
    }
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Plant a tree manually (admin only)
   */
  @Post('admin/plant-tree')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async plantTree(@Body() body: {
    registrationId: string;
    childName: string;
    motherName: string;
    location: string;
    plantingPartner?: string;
  }) {
    const tree = await this.goGreenService.plantTree(body);
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Plant trees for existing registrations (admin only)
   */
  @Post('admin/plant-trees-bulk')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async plantTreesBulk(@Body() body: {
    registrations: Array<{
      registrationId: string;
      childName: string;
      motherName: string;
      state: string;
    }>;
  }) {
    const trees = await this.goGreenService.plantTreesForExistingRegistrations(body.registrations);
    return {
      success: true,
      data: trees,
      message: `Planted ${trees.length} trees for existing registrations`,
    };
  }
}