import { Request, Response, NextFunction } from "express";
import {
    uploadFile,
    uploadUserProfilePicture,
    getUserFiles,
    deleteFile,
    getFileById
} from "@/services/file.service.js";
import AppError from "@/utils/AppError.js";


/**
 * Upload a single file. Body: category, isPublic, useCloud (all optional). Multer field: file.
 * @throws {AppError} 401 - Not authenticated
 * @throws {AppError} 400 - No file uploaded
 */
const upload = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const { category, isPublic, useCloud } = req.body;

        const file = await uploadFile({
            file: req.file,
            userId,
            category,
            isPublic: isPublic === 'true',
            useCloud: useCloud !== 'false' // Default to cloud
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: { file }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Upload multiple files. Body: category, useCloud (all optional). Multer field: files.
 * @throws {AppError} 401 - Not authenticated
 * @throws {AppError} 400 - No files uploaded
 */
const uploadMultipleFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { category, useCloud } = req.body;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0){
            throw new AppError('No files uploaded', 400);
        }

        const files = req.files as Express.Multer.File[];

        const uploadPromises = files.map(file =>
            uploadFile({
                file,
                userId,
                category: category || 'other',
                useCloud: useCloud !== 'false'
            })
        );

        const uploadFiles = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            message: `${uploadFiles.length} files uploaded successfully`,
            data: { files: uploadFiles }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Upload and set profile picture. Optimizes image and stores in cloud. Multer field: file.
 * @throws {AppError} 401 - Not authenticated
 * @throws {AppError} 400 - No file uploaded
 */
const uploadProfilePic = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const file = await uploadUserProfilePicture(req.file, userId);

        res.status(201).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: { file }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user's files. Query: category (optional) to filter by category.
 * @throws {AppError} 401 - Not authenticated
 */
const getMyFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        const { category } = req.query;

        const files = await getUserFiles(userId, category as string);

        res.status(200).json({
            success: true,
            data: { files }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a file by ID. Returns file metadata and populated uploadedBy.
 * @throws {AppError} 400 - Invalid file ID
 * @throws {AppError} 404 - File not found
 */
const getFile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const file = await getFileById(id as string);

        res.status(200).json({
            success: true,
            data: { file }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a file by ID. Only the owner can delete. Removes from cloud or local disk and DB.
 * @throws {AppError} 401 - Not authenticated
 * @throws {AppError} 404 - File not found
 */
const removeFile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            throw new AppError('Not authenticated', 401);
        }

        await deleteFile(id as string, userId);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export {
    upload,
    uploadMultipleFiles,
    uploadProfilePic,
    getMyFiles,
    getFile,
    removeFile
}