
import cloudinary from "@/config/cloudinary.js";
import AppError from "@/utils/AppError.js";
import { Readable } from "stream";
import type {
    CloudinaryUploadOptions,
    UploadToCloudinaryResponse
} from "@/types/cloud.js";



/**
 * Upload a buffer to Cloudinary via stream. Supports folder, resourceType, transformation, tags.
 * @param buffer - File content buffer
 * @param options - Folder, resourceType, transformation array, tags
 * @returns Upload result with url, secureUrl, publicId, format, width, height
 * @throws {AppError} 500 - Upload failed or no result
 */
const uploadToCloudinary = async (
    buffer: Buffer,
    options: CloudinaryUploadOptions = {}
): Promise<UploadToCloudinaryResponse> => {
    const {
        folder = 'upload',
        resourceType = 'auto',
        transformation,
        tags
    } = options;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType,
                transformation,
                tags
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new AppError('Failed to upload file to cloud', 500));
                }

                if (!result) {
                    return reject(new AppError('No result from Cloudinary', 500));
                }

                resolve({
                    url: result.url,
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    width: result.width,
                    height: result.height
                });
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        const bufferStream = Readable.from(buffer);
        bufferStream.pipe(uploadStream);
    });
};

/**
 * Delete an asset from Cloudinary by public ID.
 * @param publicId - Cloudinary public ID of the asset
 * @param resourceType - 'image' | 'video' | 'raw' (default 'image')
 * @throws {AppError} 500 - Delete failed
 */
const deleteFromCloudinary = async (
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    } catch (error) {
        console.error('Cloudinary delete error', error);
        throw new AppError('Failed to delete file from cloudinary', 500);
    }
};

/**
 * Upload a profile picture buffer to Cloudinary with resize and quality options.
 * @param buffer - Image buffer
 * @param userId - User ID (used in tags)
 * @returns Object with url and publicId
 */
const uploadProfilePicture = async (
    buffer: Buffer,
    userId: string
): Promise<{
    url: string;
    publicId: string;
}> => {
    const result = await uploadToCloudinary(buffer, {
        folder: 'profile-pictures',
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto'}
        ],
        tags: ['profile', userId]
    });

    return {
        url: result.secureUrl,
        publicId: result.publicId
    };
};

export {
    uploadToCloudinary,
    deleteFromCloudinary,
    uploadProfilePicture
};