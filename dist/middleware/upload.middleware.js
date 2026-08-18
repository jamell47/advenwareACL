"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.upload = void 0;
const fs_1 = require("fs");
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("./errorHandler");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/tmp";
        if (!(0, fs_1.existsSync)(uploadDir)) {
            (0, fs_1.mkdirSync)(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        cb(null, uniqueSuffix);
    },
});
const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".doc",
    ".docx",
    ".txt",
];
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];
const fileFilter = (req, file, cb) => {
    if (!file.originalname) {
        return cb(new errorHandler_1.APIError("No file provided", 400, "NO_FILE"), false);
    }
    const ext = `.${file.originalname.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new errorHandler_1.APIError(`File type ${ext} not allowed`, 400, "INVALID_FILE_TYPE"), false);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new errorHandler_1.APIError(`MIME type ${file.mimetype} not allowed`, 400, "INVALID_MIME_TYPE"), false);
    }
    cb(null, true);
};
const MAX_SIZE = 10 * 1024 * 1024;
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_SIZE,
        files: 1,
    },
});
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_SIZE,
        files: 10,
    },
});
//# sourceMappingURL=upload.middleware.js.map