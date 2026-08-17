import { createReadStream, statSync, existsSync, mkdirSync, copyFileSync, unlinkSync, statSync as statSyncFn } from "fs";
import path from "path";
import { env } from "../config/env";
import FormData from "form-data";
import axios from "axios";

export class StorageService {
  private static uploadDir = path.join(process.cwd(), "uploads");

  static ensureUploadDir(): void {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  static async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; path: string; filename: string }> {
    this.ensureUploadDir();

    const folderPath = path.join(this.uploadDir, folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
    const filepath = path.join(folderPath, filename);

    if (env.storageEndpoint) {
      return this.uploadToS3(file, folder, filename);
    }

    copyFileSync(file.path, filepath);

    return {
      url: `/uploads/${folder}/${filename}`,
      path: filepath,
      filename,
    };
  }

  static async uploadToS3(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<{ url: string; path: string; filename: string }> {
    const s3Endpoint = env.storageEndpoint!;
    const bucket = env.storageBucket!;
    const accessKey = env.storageAccessKey!;
    const secretKey = env.storageSecretKey!;

    const fileStream = createReadStream(file.path);
    const fileStat = statSyncFn(file.path);

    const formData = new FormData();
    formData.append("file", fileStream, {
      filename,
      knownLength: fileStat.size,
      contentType: file.mimetype,
    });

    const uploadUrl = `${s3Endpoint}/${bucket}/${folder}/${filename}`;

    await axios.put(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        "Content-Length": fileStat.size,
      },
      auth: {
        username: accessKey,
        password: secretKey,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return {
      url: uploadUrl,
      path: uploadUrl,
      filename,
    };
  }

  static async streamFile(
    filePath: string,
  ): Promise<{ stream: any; filename: string; mimeType: string; stat: any } | null> {
    const fullPath = path.join(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      return null;
    }

    const stat = statSyncFn(fullPath);
    const stream = createReadStream(fullPath);
    return { stream, filename: path.basename(fullPath), mimeType: this.getMimeType(fullPath), stat };
  }

  private static getMimeType(filepath: string): string {
    const ext = filepath.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
    };
    return mimeMap[`.${ext}`] || "application/octet-stream";
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    const fullPath = path.join(process.cwd(), filePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      return true;
    }
    return false;
  }
}
