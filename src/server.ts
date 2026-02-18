import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import { cleanupOldActivities } from "./services/activity.service.js";

// Import database connection
import connectDB from '@/config/database.js';

// Import middleware
import logger from "@/middleware/logger.js";
import errorHandler from "@/middleware/errorHandler.js";
import notFound from "@/middleware/notFound.js";
import {
  generalLimiter,
  authLimiter,
  passwordResetLimiter
} from "./middleware/rateLimiter.js";

// Import routes
import authRoutes from "@/routes/auth.routes.js";
import userRoutes from "@/routes/user.routes.js";
import testRoutes from "@/routes/test.routes.js";
import activityRoutes from '@/routes/activity.routes.js';
import apiKeyRoutes from "@/routes/apiKey.routes.js";
import demoRoutes from "@/routes/demo.routes.js";


const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV: string = process.env.NODE_ENV || 'development';

connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded( { extended: true }));

// Custom logger
app.use(logger);

// Apply general rate limiter to all routes
app.use(generalLimiter);


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

// Auth routes (with strict rate limitin)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth', authRoutes);


app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/demo', demoRoutes);

app.get('/api/test-error', (_req: Request, _res: Response, next: NextFunction) => {
    const error = new Error('This is a test error') as Error & { statusCode: number };
    error.statusCode = 400;
    next(error);
});


// Error handling
app.use(notFound);
app.use(errorHandler);


// Start server
app.listen(PORT, (): void => {
  console.log('=================================');
  console.log(`🚀 Server Status: RUNNING`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💙 TypeScript: ENABLED`);
  console.log(`🍃 MongoDB: CONNECTING...`);
  console.log(`🔐 Rate Limiting: ENABLED`);
  console.log('=================================');
  console.log('📋 Available Routes:');
  console.log('   Auth: /api/auth/*');
  console.log('   Users: /api/users/*');
  console.log('   Activities: /api/activities/*');
  console.log('   API Keys: /api/api-keys/*');
  console.log('   Demo: /api/demo/*');
  console.log('=================================');

  // Run cleanup daily at midnight
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0){
      await cleanupOldActivities(90); // 90 days
    }
  }, 60000); // Checevery minute
});
