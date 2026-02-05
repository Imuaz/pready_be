import "dotenv/config";
import express, { Express } from "express";

// Import middleware
import logger from "@/middleware/logger.ts";
import errorHandler from "@/middleware/errorHandler.ts";
import notFound from "@/middleware/notFound.ts";

// Import routes
import authRoutes from "@/routes/auth.routes.ts";
import userRoutes from "@/routes/user.routes.ts"

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Middlewares
app.use(express.json());
app.use(express.urlencoded( { extended: true }));
app.use(logger);


app.get("/", (req, res) => {
    res.json({
        message: "Welcome Master backend API!",
        status: "Server is running",
        timestamp: new Date().toISOString()
    })
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/test-error', (req, res, next) => {
    const error = new Error('This is a test error') as Error & { statusCode: number };
    error.statusCode = 400;
    next(error);
});


// Error handling
app.use(notFound);
app.use(errorHandler);


// Start server
app.listen(PORT, () => {
    console.log('==================================')
    console.log(`Server Status: RUNNING`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log(`TypeScript: ENABLED`)
    console.log('===================================')
});