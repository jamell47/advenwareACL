import axios, { AxiosResponse } from "axios";
import { env } from "../config/env";
import { createLogger } from "./logger.util";
import { APIError } from "../middleware/errorHandler";
import crypto from "crypto";
import path from "path";
import fs from "fs";

const logger = createLogger("storage-service");

export interface UploadResult {
  url: string;
  key: string;
}

export class StorageService {
  /**
   * Returns true when production persistent storage (S3-compatible) is configured.
   */
  static isCloudStorage(): boolean {
    return !!(env.storageEndpoint && (env.storageEndpoint.startsWith("http://") || env.storageEndpoint.startsWith("https://")));
  }

  /**
   * Build the public-facing URL for a stored file.
   * - Cloud storage: returns the full S3 URL (e.g. https://bucket.s3.amazonaws.com/folder/file)
   * - Local storage: returns the relative path (e.g. /uploads/folder/file)
   */
  static buildUrl(storagePath: string): string {
    if (this.isCloudStorage()) {
      const base = env.storageEndpoint!.replace(/\/$/, "");
      return `${base}/${env.storageBucket}/${storagePath}`;
    }
    return `/uploads/${storagePath}`;
  }

  /**
   * Upload a file to storage.
   * If storageEndpoint is set and starts with http:// or https://, use S3-compatible PUT.
   * Otherwise, write to local filesystem under uploads/{folder}/{filename}.
   */
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

      return { url, key: storagePath };
    }

    // Local filesystem upload
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, uniqueName);
    await fs.writeFile(fullPath, file.buffer);

    return { url: `/uploads/${storagePath}`, key: storagePath };
  }

  /**
   * Delete a file from storage.
   * Accepts either a storage key or a full URL/path.
   */
  static async deleteFile(identifier: string): Promise<void> {
    // Normalize: strip leading /uploads/ if present
    let key = identifier;
    if (key.startsWith("/uploads/")) {
      key = key.replace(/^\/uploads\//, "");
    }

    if (this.isCloudStorage()) {
      const url = this.buildUrl(key);
      try {
        await axios.delete(url, {
          timeout: 30000,
        });
      } catch (err: any) {
        logger.warn("S3 delete failed (ignored)", { error: err.message, key });
      }
      return;
    }

    // Local filesystem delete
    const fullPath = path.join(process.cwd(), "uploads", key);
    try {
      await fs.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        logger.warn("Local file delete failed", { error: err.message, fullPath });
      }
    }
  }

  /**
   * Stream a file from storage to an Express response.
   * Works for both cloud and local storage.
   * Returns true if the file was found and streamed, false otherwise.
   */
  static async streamFile(res: any, storagePath: string): Promise<boolean> {
    if (this.isCloudStorage()) {
      const url = this.buildUrl(storagePath);
      try {
        const response = await axios.get(url, {
          responseType: "stream",
          timeout: 60000,
        });

        res.set("Content-Type", response.headers["content-type"] || "application/octet-stream");
        response.data.pipe(res);
        return true;
      } catch (err: any) {
        logger.error("Cloud file stream failed", { error: err.message, url });
        return false;
      }
    }

    // Local filesystem
    const fullPath = path.join(process.cwd(), "uploads", storagePath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    const stat = fs.statSync(fullPath);
    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Length", stat.size);
    fs.createReadStream(fullPath).pipe(res);
    return true;
  }
}