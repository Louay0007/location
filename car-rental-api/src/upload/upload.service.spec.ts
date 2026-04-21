import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import sharp from 'sharp';

jest.mock('sharp');
jest.mock('fs/promises');

describe('UploadService', () => {
  let service: UploadService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockFile = {
    buffer: Buffer.from('test image data'),
    mimetype: 'image/jpeg',
    size: 1024 * 1024,
    originalname: 'test.jpg',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get<ConfigService>(ConfigService);

    mockConfigService.get.mockReturnValue('./uploads');
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should throw BadRequestException for invalid mime type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };

      await expect(service.uploadImage(invalidFile)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 };

      await expect(service.uploadImage(largeFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadMultipleImages', () => {
    it('should handle empty array', async () => {
      const result = await service.uploadMultipleImages([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteImage', () => {
    it('should delete image file', async () => {
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.deleteImage('/uploads/test-image.webp');

      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(service.deleteImage('/uploads/nonexistent.webp')).resolves.not.toThrow();
    });
  });

  describe('getUploadPath', () => {
    it('should return upload path', () => {
      const result = service.getUploadPath();

      expect(result).toBe('./uploads');
    });
  });
});
