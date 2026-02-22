import express from "express";
import { protect } from "@/middleware/auth.js";
import { imageUpload, profileUpload } from "@/config/upload.js";
import {
    upload,
    uploadProfilePic,
    getMyFiles,
    getFile,
    removeFile
} from "@/controllers/file.controller.js";

const router = express.Router();

// All file routes require authentication
router.use(protect);

// @route   GET /api/files
// @desc    Get current user's files (optional ?category=)
// @access  Private
router.get('/', getMyFiles);

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Private
router.get('/:id', getFile);

// @route   POST /api/files
// @desc    Upload file (body: category, isPublic, useCloud; field: file)
// @access  Private
router.post('/', imageUpload.single('file'), upload);

// @route   POST /api/files/profile-picture
// @desc    Upload profile picture (field: file)
// @access  Private
router.post('/profile-picture', profileUpload.single('file'), uploadProfilePic);

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', removeFile);

export default router;
