import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import File from "@/models/file.model.js";
import AppError from "@/utils/AppError.js";
import type { IFile, UploadFileData } from "@/types/file.js";
import {
    uploadToCloudinary,
    deleteFromCloudinary
} from "./cloudinary.service.js";
import {
    optimizeProfilePicture,
    getImageMetadata
} from "./image.service.js";



/**
 * Upload file
 * @param data - File data to upload
 */
const uploadFile = async (data: UploadFileData): Promise<IFile> => {
    const {
        file,
        userId,
        category = 'other',
        isPublic = false,
        useCloud = true
    } = data;

    let fileUrl: string;
    let cloudinaryId: string | undefined;
    let filePath: string;

    if (useCloud) {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, {
            folder: `uploads/${category}`,
            tags: [userId, category]
        });

        fileUrl = result.secureUrl;
        cloudinaryId = result.publicId;
        filePath = result.publicId;
    } else {
        // Local storage
        filePath = file.path;
        fileUrl = `/uploads/${path.basename(file.path)}`;
    }

    // Get metadata for images
    let metadata: any = {};
    if (file.mimetype.startsWith('image/') && file.buffer) {
        const imageMetadata = await getImageMetadata(file.buffer);
        metadata = imageMetadata;
    }

    // Save to database
    const fileDoc = await File.create({
        filename: file.filename || path.basename(filePath),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: fileUrl,
        cloudinaryId,
        uploadedBy: new mongoose.Types.ObjectId(userId),
        category,
        isPublic,
        metadata
    });

    return fileDoc;
};

/**
 * Upload Profile picture
 * @param file - file to upload
 * @param userId - User ID
 */
const uploadProfilePicture = async (
    file: Express.Multer.File,
    userId: string
): Promise<IFile> => {
    // Optimize image
    const optimizedBuffer = await optimizeProfilePicture(file.buffer)

    // Upload to Cloudinary
    const result = await uploadToCloudinary(optimizedBuffer, {
        folder: 'profile-picture',
        transformation: [
            { width: 400, height: 400, crop: 'fill' }
        ],
        tags: [userId, 'profile']
    });

    // Get metadata
    const metadata = await getImageMetadata(optimizedBuffer);

    // Save to database
    const fileDoc = await File.create({
        filename: `profile-${userId}.webp`,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: optimizedBuffer.length,
        path: result.publicId,
        url: result.secureUrl,
        cloudinaryId: result.publicId,
        uploadedBy: new mongoose.Types.ObjectId(userId),
        category: 'profile',
        isPublic: true,
        metadata
    });

    return fileDoc;
};

/**
 * Get user files
 * @param userId - User ID
 * @param category - File category
 */
const getUserFiles = async (
    userId: string,
    category?: string
): Promise<IFile[]> => {
    const filter: any = {
        uploadedBy: new mongoose.Types.ObjectId(userId)
    };

    if (category) {
        filter.category = category;
    }

    const files = await File.find(filter)
        .sort({ createdAt: -1 })
        .lean();
    
    return files;
};

/**
 * Delete file
 * @param fileId - File ID
 * @param userId - User ID
 */
const deleteFile = async (
    fileId: string,
    userId: string
): Promise<void> => {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new AppError('Invalid file ID', 400);
    }

    const file = await File.findOne({
        _id: fileId,
        uploadedBy: new mongoose.Types.ObjectId(userId)
    });

    if (!file) {
        throw new AppError('File not found', 404);
    }

    // Delete from cloud if applicable
    if (file.cloudinaryId) {
        await deleteFromCloudinary(file.cloudinaryId);
    } else {
        // Delete local file
        const fullPath = path.resolve(file.path);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }

    // Delete from database
    await File.findOneAndDelete({ _id: fileId });
};

/**
 * Get file by ID
 * @param fileId - File ID
 */
const getFileById = async (fileId: string): Promise<IFile> => {
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
        throw new AppError('Invalid file ID', 400);
    }

    const file = await File.findById(fileId)
        .populate('uploadedBy', 'name email')
        .lean();
    
    if (!file) {
        throw new AppError('File not found', 404);
    }

    return file;
};

export {
    uploadFile,
    uploadProfilePicture as uploadUserProfilePicture,
    getUserFiles,
    deleteFile,
    getFileById
};