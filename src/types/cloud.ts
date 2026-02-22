
export interface CloudinaryUploadOptions {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any[];
    tags?: string[];
}

export interface UploadToCloudinaryResponse {
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width?: number;
    height?: number;
};