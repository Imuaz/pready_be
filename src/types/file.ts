import mongoose, { Document } from "mongoose";


export interface IFile extends Document {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    cloudinaryId?: string;
    s3Key?: string;
    uploadedBy: mongoose.Types.ObjectId;
    category: 'profile' | 'document' | 'image' | 'video' | 'other';
    isPublic: boolean;
    metadata?: {
      width?: number;
      height?: number;
      duration?: number;
      [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
  }

export interface ProcessImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  }
  
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number;
  }

export interface UploadFileData {
  file: Express.Multer.File;
  userId: string;
  category?: 'profile' | 'document' | 'image' | 'video' | 'other';
  isPublic?: boolean;
  useCloud?: boolean;
}