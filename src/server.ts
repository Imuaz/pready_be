import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";

// Import middleware
import logger from "@/middleware/logger.js";
import errorHandler from "@/middleware/errorHandler.js";
import notFound from "@/middleware/notFound.js";

// Import routes
import authRoutes from "@/routes/auth.routes.js";
import userRoutes from "@/routes/user.routes.js";
// ...existing code...

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Middlewares
app.use(express.json());
app.use(express.urlencoded( { extended: true }));
app.use(logger);


// Health check endpoint with typed request and response
app.get('/', (_req: Request, res: Response): void => {
  res.json({ 
    success: true,
    message: 'Backend Master API with TypeScript!',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/test-error', (_req: Request, _res: Response, next: NextFunction) => {
    const error = new Error('This is a test error') as Error & { statusCode: number };
    error.statusCode = 400;
    next(error);
});


// Error handling
app.use(notFound);
app.use(errorHandler);


// Start server
app.listen(PORT, () => {
    console.log('==================================');
    console.log(`Server Status: RUNNING`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log(`TypeScript: ENABLED`)
    console.log('===================================');
    console.log('📋 Available Routes:');
    console.log('   GET  /');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/logout');
    console.log('   GET  /api/users/profile');
    console.log('   PUT  /api/users/profile');
    console.log('   GET  /api/users');
    console.log('   GET  /api/test-error');
    console.log('=================================');
});