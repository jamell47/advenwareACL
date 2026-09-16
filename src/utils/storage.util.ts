import axios, { AxiosResponse } from "axios";
import { env } from "../config/env";
import { createLogger } from "./logger.util";
import { APIError } from "../middleware/errorHandler";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";

const logger = createLogger("storage-service");

export interface UploadResult {
  url: string;
  key: string;
  path: string;
  filename: string;
}

export class StorageService {
  static isCloudStorage(): boolean {
    return !!(env.storageEndpoint && (env.storageEndpoint.startsWith("http://") || env.storageEndpoint.startsWith("https://")));
  }

  static buildUrl(storagePath: string): string {
    if (this.isCloudStorage()) {
      const base = env.storageEndpoint!.replace(/\/$/, "");
      return `${base}/${env.storageBucket}/${storagePath}`;
    }
    return `/uploads/${storagePath}`;
  }

  static async uploadFile(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const ext = path.extname(file.originalname) || "";
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const storagePath = `${folder}/${uniqueName}`;

    if (this.isCloudStorage()) {
      const url = this.buildUrl(storagePath);

      try {
        const response: AxiosResponse = await axios.put(url, file.buffer, {
          headers: {
            "Content-Type": file.mimetype || "application/octet-stream",
            "Content-Length": file.size,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 60000,
        });

        if (response.status < 200 || response.status >= 300) {
          throw new Error(`S3 upload failed with status ${response.status}`);
        }
      } catch (err: any) {
        logger.error("S3 upload failed", { error: err.message, url });
        throw new APIError("Failed to upload file to storage", 500, "STORAGE_UPLOAD_FAILED");
      }

      return { url, key: storagePath, path: url, filename: file.originalname };
    }

    const uploadDir = path.join(process.cwd(), "uploads", folder);
    await fsp.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, uniqueName);
    await fsp.writeFile(fullPath, file.buffer);

    return { url: `/uploads/${storagePath}`, key: storagePath, path: `/uploads/${storagePath}`, filename: file.originalname };
  }

  static async deleteFile(identifier: string): Promise<void> {
    let key = identifier;
    if (key.startsWith("/uploads/")) {
      key = key.replace(/^\/uploads\//, "");
    }

    if (this.isCloudStorage()) {
      const url = this.buildUrl(key);
      try {
        await axios.delete(url, { timeout: 30000 });
      } catch (err: any) {
        logger.warn("S3 delete failed (ignored)", { error: err.message, key });
      }
      return;
    }

    const fullPath = path.join(process.cwd(), "uploads", key);
    try {
      await fsp.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        logger.warn("Local file delete failed", { error: err.message, fullPath });
      }
    }
  }

  static async streamFile(storagePath: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; stat?: fs.Stats } | null> {
    if (this.isCloudStorage()) {
      const url = this.buildUrl(storagePath);
      try {
        const response: AxiosResponse = await axios.get(url, {
          responseType: "stream",
          timeout: 60000,
        });
        return {
          stream: response.data,
          mimeType: String(response.headers["content-type"] || "application/octet-stream"),
        };
      } catch (err: any) {
        logger.error("Cloud file stream failed", { error: err.message, url });
        return null;
      }
    }

    const fullPath = path.join(process.cwd(), "uploads", storagePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const stat = fs.statSync(fullPath);
    const stream = fs.createReadStream(fullPath);
    return { stream, mimeType: "application/octet-stream", stat };
  }
}
