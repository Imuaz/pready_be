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
 * Upload single file
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
 * Upload profile picture
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
 * Get user's files
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
 * Get file by ID
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
 * Delete file
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
    uploadProfilePic,
    getMyFiles,
    getFile,
    removeFile
}