import { Request, Response, NextFunction } from "express";
import type { CustomError } from "@/types/type.d.ts";

// Global error handling middleware
const errorHandler = ( 
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log the error for debugging 
    console.error('ERROR:', err.message);
    console.error('Stack:', err.stack);


    // Determine status code
    // If error has statusCode property, use it, otherwise default to 500
    const statusCode: number = err.statusCode || 500;

    // Determine error message
    // In production, hide internal errors from users
    const message: string = process.env.NODE_ENV === 'production' ? 'Something went wrong': err.message;

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        // Only show stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack})
    });
};

export default errorHandler;