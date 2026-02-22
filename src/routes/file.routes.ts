import express from "express";
import { protect } from "@/middleware/auth.js";
import {
    imageUpload,
    profileUpload,
    documentUpload,
    genericUpload
} from "@/config/upload.js";
import {
    upload,
    uploadProfilePic,
    getMyFiles,
    getFile,
    removeFile
} from "@/controllers/file.controller.js";

/**
 * File routes. Base path: /api/files. All routes require authentication.
 * Upload endpoints expect multipart/form-data with field "file".
 */
const router = express.Router();

router.use(protect);

// @route   POST /api/files/upload/image
// @desc    Upload image file (field: file)
// @access  Private
router.post('/upload/image', imageUpload.single('file'), upload);

// @route   POST /api/files/upload/document
// @desc    Upload document file (field: file)
// @access  Private
router.post('/upload/document', documentUpload.single('file'), upload);

// @route   POST /api/files/upload/profile
// @desc    Upload profile picture (field: file)
// @access  Private
router.post('/upload/profile', profileUpload.single('file'), uploadProfilePic);

// @route   POST /api/files/upload
// @desc    Upload any allowed type (field: file; body: category, isPublic, useCloud)
// @access  Private
router.post('/upload', genericUpload.single('file'), upload);

// @route   GET /api/files
// @desc    Get current user's files (optional ?category=)
// @access  Private
router.get('/', getMyFiles);

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Private
router.get('/:id', getFile);

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', removeFile);

export default router;
