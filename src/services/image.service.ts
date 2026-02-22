import sharp from "sharp";
import path from "path";
import fs from "fs";
import AppError from "@/utils/AppError.js";
import type {
    ProcessImageOptions,
    ImageMetadata 
} from "@/types/file.js";


/**
 * Process and optimize an image: optional resize, format (jpeg/png/webp), quality, fit.
 * @param buffer - Image buffer from memory storage
 * @param options - width, height, quality, format, fit
 * @returns Processed image buffer
 * @throws {AppError} 500 - Processing failed
 */
const processImage = async (
    buffer: Buffer,
    options: ProcessImageOptions = {}
): Promise<Buffer> => {
    const {
        width,
        height,
        quality = 80,
        format = 'jpeg',
        fit = 'cover'
    } = options;

    try {
        let image = sharp(buffer);

        // Resize if dimensions provided
        if (width || height) {
            image = image.resize(width, height, {
                fit,
                withoutEnlargement: true
            });
        }

        // Cover format and compress
        switch (format) {
            case 'jpeg':
                image = image.jpeg({ quality, mozjpeg: true });
                break;
            case 'png':
                image = image.png({ quality, compressionLevel: 9 });
                break;
            case 'webp':
                image = image.webp({ quality });
                break;
        }

        return await image.toBuffer();

    } catch (error) {
        console.error('Image processing error:', error);
        throw new AppError('Failed to process image', 500);
    }
};

/**
 * Create multiple size variants (thumbnail, medium, large) plus optimized original; all WebP on disk.
 * @param buffer - Source image buffer
 * @param outputDir - Directory to write variant files
 * @param filename - Base filename (extension not used; .webp is used)
 * @returns Object with keys thumbnail, medium, large, original (filenames)
 */
const createImageVariants = async (
    buffer: Buffer,
    outputDir: string,
    filename: string
): Promise<{
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
}> => {
    const ext = '.webp'; // Use WebP for best compression
    const baseName = path.parse(filename).name;

    const sizes = {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 500, height: 500 },
        large: { width: 1200, height: 1200}
    };

    const variants: any = {};

    // Create variants
    for (const [variant, dimensions] of Object.entries(sizes)) {
        const processedBuffer = await processImage(buffer, {
            ...dimensions,
            format: 'webp',
            quality: 80
        });

        const variantFilename = `${baseName}-${variant}${ext}`;
        const variantPath = path.join(outputDir, variantFilename);

        await fs.promises.writeFile(variantPath, processedBuffer);
        variants[variant] = variantFilename;
    }

    // Save original (optimized)
    const optimizedBuffer = await processImage(buffer, {
        format: 'webp',
        quality: 90
    });
    const originalFilename = `${baseName}-original${ext}`;
    const originalPath = path.join(outputDir, originalFilename);
    await fs.promises.writeFile(originalPath, optimizedBuffer);
    variants.original = originalFilename;

    return variants;
};

/**
 * Extract image metadata (width, height, format, size) from a buffer.
 * @param buffer - Image buffer
 * @returns ImageMetadata with width, height, format, size
 * @throws {AppError} 500 - Failed to read metadata
 */
const getImageMetadata = async (
    buffer: Buffer
): Promise<ImageMetadata> => {
    try {
        const metadata = await sharp(buffer).metadata();

        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            size: buffer.length
        };
    } catch (error) {
        throw new AppError('Failed to read image metadata', 500);
    }
};

/**
 * Optimize buffer as profile picture: 400x400, cover fit, WebP, quality 85.
 * @param buffer - Image buffer
 * @returns Optimized image buffer
 */
const optimizeProfilePicture = async (
    buffer: Buffer
): Promise<Buffer> => {
    return processImage(buffer, {
        width: 400,
        height: 400,
        fit: 'cover',
        format: 'webp',
        quality: 85
    });
};

export {
    processImage,
    createImageVariants,
    getImageMetadata,
    optimizeProfilePicture
};