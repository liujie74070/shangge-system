import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return {
      url: `/uploads/${filename}`,
      filename,
    };
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    const urls: string[] = [];
    for (const file of files) {
      const result = await this.uploadFile(file);
      urls.push(result.url);
    }
    return { urls };
  }
}
