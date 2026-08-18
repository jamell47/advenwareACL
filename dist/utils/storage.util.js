"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
class StorageService {
    static uploadDir = path_1.default.join(process.cwd(), "uploads");
    static ensureUploadDir() {
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    static async uploadFile(file, folder) {
        this.ensureUploadDir();
        const folderPath = path_1.default.join(this.uploadDir, folder);
        if (!(0, fs_1.existsSync)(folderPath)) {
            (0, fs_1.mkdirSync)(folderPath, { recursive: true });
        }
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        const filename = `${path_1.default.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
        const filepath = path_1.default.join(folderPath, filename);
        if (env_1.env.storageEndpoint) {
            return this.uploadToS3(file, folder, filename);
        }
        (0, fs_1.copyFileSync)(file.path, filepath);
        return {
            url: `/uploads/${folder}/${filename}`,
            path: filepath,
            filename,
        };
    }
    static async uploadToS3(file, folder, filename) {
        const s3Endpoint = env_1.env.storageEndpoint;
        const bucket = env_1.env.storageBucket;
        const accessKey = env_1.env.storageAccessKey;
        const secretKey = env_1.env.storageSecretKey;
        const fileStream = (0, fs_1.createReadStream)(file.path);
        const fileStat = (0, fs_1.statSync)(file.path);
        const formData = new form_data_1.default();
        formData.append("file", fileStream, {
            filename,
            knownLength: fileStat.size,
            contentType: file.mimetype,
        });
        const uploadUrl = `${s3Endpoint}/${bucket}/${folder}/${filename}`;
        await axios_1.default.put(uploadUrl, formData, {
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
    static async streamFile(filePath) {
        const fullPath = path_1.default.join(process.cwd(), filePath);
        if (!(0, fs_1.existsSync)(fullPath)) {
            return null;
        }
        const stat = (0, fs_1.statSync)(fullPath);
        const stream = (0, fs_1.createReadStream)(fullPath);
        return { stream, filename: path_1.default.basename(fullPath), mimeType: this.getMimeType(fullPath), stat };
    }
    static getMimeType(filepath) {
        const ext = filepath.split(".").pop()?.toLowerCase();
        const mimeMap = {
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
    static async deleteFile(filePath) {
        const fullPath = path_1.default.join(process.cwd(), filePath);
        if ((0, fs_1.existsSync)(fullPath)) {
            (0, fs_1.unlinkSync)(fullPath);
            return true;
        }
        return false;
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.util.js.map