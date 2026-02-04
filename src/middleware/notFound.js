// Handles requests to undefined
const notFound = (req, res, next) => {
    // Create error object
    const error = new Error(`Not Found - ${req.originalUrl}`);

    // Set status code on error object
    error.statusCode = 404;

    // Pass error to error handler
    next(error);
};

export default notFound;