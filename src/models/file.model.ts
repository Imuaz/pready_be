import mongoose, { Schema, Model }  from "mongoose";
import { IFile } from "@/types/file.js";   


const FileSchema: Schema<IFile> = new Schema(
    {
        filename: {
            type: String,
            required: true,
            unique: true
        },
        originalName: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        cloudinaryId: {
            type: String,
        },
        s3Key: {
            type: String,
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        category: {
            type: String,
            enum: ['profile', 'document', 'image', 'video', 'other'],
            default: 'other'
        },
        isPublic: {
            type: Boolean,
            default: false
        },
        metadata: {
            type: Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for better query performance
FileSchema.index({ uploadedBy: 1, createdAt: -1 });
FileSchema.index({ category: 1 });
FileSchema.index({ mimeType: 1 });

const File: Model<IFile> = mongoose.model<IFile>('File', FileSchema);

export default File;