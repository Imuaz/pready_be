import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import AppError from "@/utils/AppError.js";


// Ensure upload directories exist
const uploadDir = './uploads';
const categories = ['profile', 'documents', 'images', 'videos', 'temp' ];

categories.forEach(category => {
    const dir = path.join(uploadDir, category);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true});
    }
});

/**
 * Allowed file types
 */
const allowedMimeTypes = {
    images: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ],
    documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    ],
    videos: [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideon'
    ]
};

/**
 * File filter function
 */
const fileFilter = (allowedTypes: string[]) => {
    return (
        _req: Express.Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new AppError(
                    `Invalid file type. Allowed type: ${allowedTypes.join(', ')}`,
                    400
                )
            );
        }
    };
};

/**
 * Disk storage for local uploads
 */
const diskStorage = (category: string) => {
    return multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, path.join(uploadDir, category));
        },
        filename: (_req, file, cb) => {
            // Generate unique file name
            const uniqueSuffix = crypto.randomBytes(16).toString('hex');
            const ext = path.extname(file.originalname);
            const filename = `${Date.now()}-${uniqueSuffix}${ext}`;
            cb(null, filename);
        }
    });
};

/**
 * Memory storage (for processing before upload to cloud)
 */
const memoryStorage = multer.memoryStorage();

/**
 * File size limits (in bytes)
 * Best practices:
 * - Profile images: 1-2MB (small, frequently accessed)
 * - General images: 2-5MB (balance quality vs storage)
 * - Documents: 5-10MB (PDFs, Word docs can be large)
 * - Videos: 50-100MB+ (videos are inherently large)
 */
const FILE_SIZE_LIMITS = {
    PROFILE: 2 * 1024 * 1024,        // 2MB - allows good quality without being excessive
    IMAGE: 5 * 1024 * 1024,          // 5MB - reasonable for high-res photos
    DOCUMENT: 10 * 1024 * 1024,      // 10MB - accommodates large PDFs/documents
    VIDEO: 100 * 1024 * 1024,        // 100MB - reasonable for short videos
    GENERIC: 50 * 1024 * 1024        // 50MB - catch-all for mixed content
};

/**
 * Image upload configuration
 * Uses memory storage for processing/transformation before cloud upload
 * Limit: 5MB - sufficient for high-quality images while preventing abuse
 */
const imageUpload = multer({
    storage: memoryStorage, // Use memory for processing before cloud upload
    fileFilter: fileFilter(allowedMimeTypes.images),
    limits: {
        fileSize: FILE_SIZE_LIMITS.IMAGE,
        files: 10, // Max 10 files per request
        fieldSize: 1024 * 1024 // 1MB max for other form fields
    }
});

/**
 * Document upload configuration
 * Uses disk storage for direct file handling
 * Limit: 10MB - accommodates large PDFs, Word docs, Excel files
 */
const documentUpload = multer({
    storage: diskStorage('documents'),
    fileFilter: fileFilter(allowedMimeTypes.documents),
    limits: {
        fileSize: FILE_SIZE_LIMITS.DOCUMENT,
        files: 5, // Max 5 documents per request
        fieldSize: 1024 * 1024 // 1MB max for other form fields
    }
});

/**
 * Profile picture upload
 * Uses memory storage for image processing/resizing before upload
 * Limit: 2MB - sufficient quality for profile pics while keeping size reasonable
 */
const profileUpload = multer({
    storage: memoryStorage, // Use memory for resizing/optimization
    fileFilter: fileFilter(allowedMimeTypes.images),
    limits: {
        fileSize: FILE_SIZE_LIMITS.PROFILE,
        files: 1, // Only one profile picture at a time
        fieldSize: 1024 * 1024 // 1MB max for other form fields
    }
});

/**
 * Video upload configuration
 * Uses disk storage for large video files
 * Limit: 100MB - reasonable for short videos, prevents abuse
 */
const videoUpload = multer({
    storage: diskStorage('videos'),
    fileFilter: fileFilter(allowedMimeTypes.videos),
    limits: {
        fileSize: FILE_SIZE_LIMITS.VIDEO,
        files: 1, // One video at a time (videos are large)
        fieldSize: 1024 * 1024 // 1MB max for other form fields
    }
});

/**
 * Generic upload (multiple file types)
 * Use with caution - less restrictive, suitable for admin/internal tools
 * Limit: 50MB - catch-all for mixed content types
 */
const genericUpload = multer({
    storage: diskStorage('temp'),
    fileFilter: fileFilter([
        ...allowedMimeTypes.images,
        ...allowedMimeTypes.documents,
        ...allowedMimeTypes.videos
    ]),
    limits: {
        fileSize: FILE_SIZE_LIMITS.GENERIC,
        files: 10, // Max 10 files per request
        fieldSize: 1024 * 1024 // 1MB max for other form fields
    }
});

export {
    imageUpload,
    documentUpload,
    profileUpload,
    videoUpload,
    genericUpload,
    allowedMimeTypes,
    uploadDir,
    FILE_SIZE_LIMITS
};