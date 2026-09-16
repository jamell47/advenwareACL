import multer from "multer";
import { APIError } from "./errorHandler";

const storage = multer.memoryStorage();

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

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: any) => {
  if (!file.originalname) {
    return cb(new APIError("No file provided", 400, "NO_FILE"), false);
  }

  const ext = `.${file.originalname.split(".").pop()?.toLowerCase()}`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new APIError(`File type ${ext} not allowed`, 400, "INVALID_FILE_TYPE"), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new APIError(`MIME type ${file.mimetype} not allowed`, 400, "INVALID_MIME_TYPE"), false);
  }

  cb(null, true);
};

const MAX_SIZE = 10 * 1024 * 1024;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
});

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 10,
  },
});
