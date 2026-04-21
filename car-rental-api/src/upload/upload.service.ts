import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;

  constructor(private config: ConfigService) {
    this.uploadPath = this.config.get('UPLOAD_PATH') || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch {}
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non autorise');
    }
    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux (max 5MB)');
    }

    const filename = `${uuidv4()}.webp`;
    const filepath = join(this.uploadPath, filename);

    try {
      await sharp(file.buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);
    } catch (error) {
      throw new BadRequestException('Erreur traitement image');
    }

    return `/uploads/${filename}`;
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const urls = [];
    for (const file of files) {
      const url = await this.uploadImage(file);
      urls.push(url);
    }
    return urls;
  }

  async deleteImage(url: string): Promise<void> {
    try {
      const filename = url.split('/').pop();
      if (!filename) return;
      const filepath = join(this.uploadPath, filename);
      await fs.unlink(filepath);
    } catch {
    }
  }

  getUploadPath(): string {
    return this.uploadPath;
  }
}