// Custom logging middleware
const logger = (req, res, next) => {
    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Get request method
    const method = req.method;
    const url = req.url;

    // Log the current request
    console.log(`[${timestamp}] ${method} ${url}`);

    // IMPORTANT: Call next() to pass controll to the next middleware/routes
    // withoute this, the request hangs forever!
    next();
}

export default logger;