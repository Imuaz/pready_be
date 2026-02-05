import { Request, Response, NextFunction } from "express";


// Custom logging middleware
const logger = (req: Request, _res: Response, next: NextFunction): void => {
    // Get current timestamp
    const timestamp: string = new Date().toISOString();

    // Get request method
    const method: string = req.method;
    const url: string = req.url;

    // Log the current request
    console.log(`[${timestamp}] ${method} ${url}`);

    // IMPORTANT: Call next() to pass controll to the next middleware/routes
    // withoute this, the request hangs forever!
    next();
}

export default logger;