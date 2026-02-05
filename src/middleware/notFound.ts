import { Request, Response, NextFunction } from "express";

// Handles requests to undefined
const notFound = (req: Request, _res: Response, next: NextFunction): void => {
    // Create error object with custom properties
    const error = new Error(`Not Found - ${req.originalUrl}`) as Error & {
        statusCode: number;
    };

    // Set status code on error object
    error.statusCode = 404;

    // Pass error to error handler
    next(error);
};

export default notFound;