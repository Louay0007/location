import {
  Controller, Post, Body, Param, UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private vehiclesService: VehiclesService,
  ) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadImage(@UploadedFiles() files: { file?: Express.Multer.File[] }) {
    if (!files.file || !files.file[0]) {
      return { error: 'Aucun fichier fourni' };
    }
    const url = await this.uploadService.uploadImage(files.file[0]);
    return { url };
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { error: 'Aucun fichier fourni' };
    }
    const urls = await this.uploadService.uploadMultipleImages(files);
    return { urls };
  }

  @Post('vehicle/:id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ]))
  @ApiConsumes('multipart/form-data')
  async uploadVehicleImage(
    @Param('id') id: string,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
  ) {
    if (!files.file || !files.file[0]) {
      return { error: 'Aucun fichier fourni' };
    }
    const url = await this.uploadService.uploadImage(files.file[0]);
    await this.vehiclesService.addVehicleImage(parseInt(id), url);
    return { url };
  }
}