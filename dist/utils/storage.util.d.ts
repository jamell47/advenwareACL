export declare class StorageService {
    private static uploadDir;
    static ensureUploadDir(): void;
    static uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
        path: string;
        filename: string;
    }>;
    static uploadToS3(file: Express.Multer.File, folder: string, filename: string): Promise<{
        url: string;
        path: string;
        filename: string;
    }>;
    static streamFile(filePath: string): Promise<{
        stream: any;
        filename: string;
        mimeType: string;
        stat: any;
    } | null>;
    private static getMimeType;
    static deleteFile(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=storage.util.d.ts.map