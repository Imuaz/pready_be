import { Request, Response, NextFunction } from "express";
import AppError from "@/utils/AppError.js";

// Global error handling middleware
const errorHandler = ( 
    err: AppError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    // Default error values
    let statusCode: number = 500;
    let message: string = 'Internal Server Error';
    let isOperational: boolean = false;

    // Handle our custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidatioanError') {
        statusCode = 400;
        message = err.message;
        isOperational = true;
    }

    // Handle Mongoose duplicate key error
    if ('code' in err && err.code === 110000) {
        statusCode = 409; // Conflict
        message = 'Duplicate field value entered'
        isOperational = true;
    }

    // Handle mongoose invalid ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        isOperational = true;
    }

    // Log non-operationa errors (bugs)
    if (!isOperational) {
        console.error('💥 UNEXPECTED ERROR:', err)
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
};

export default errorHandler;