import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "@/utils/jwt.js";


// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

let io: SocketIOServer;

/**
 * Initialize Socket.is server
 */
const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:4000',
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });


    // Authentication middleware
    io.use(async (socket: Socket, next) => {
        try {
            // Get token from handshake
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            // Verify token
            const decoded = verifyAccessToken(token);

            // Attach user data to socket
            (socket as any).userId = decoded.id;
            (socket as any).userEmail = decoded.email;

            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        const userEmail = (socket as any).userEmail;

        console.log(`User connected: ${userEmail} (${socket.id})`);

        // Store connection
        connectedUsers.set(userId, socket.id);

        // Emit connection success
        socket.emit('connected', {
            message: 'Connected to notification server',
            userId
        });

        // Join user's personal room
        socket.join(`user:${userId}`);

        // Handle disconnet
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userEmail} (${socket.id})`);
            connectedUsers.delete(userId);
        });

        // Handle mark notification as read
        socket.on('mark-read', async (notificationId: string) => {
            console.log(`Mark notification as read: ${notificationId}`);
            // This will be handled by notification service
        });

        // handle typing indicators (bonus feature)
        socket.on('typing', (data: { room: string }) => {
            socket.to(data.room).emit('user-typing', {
                userId,
                userEmail
            });
        });

        socket.on('stop-typing', (data: { room: string }) => {
            socket.to(data.room).emit('user-stop-typing', {
                userId,
                userEmail
            });
        });
    });

    return io;
};

/**
 * Get Socket.io instance
 */
const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId: string): boolean => {
    return connectedUsers.has(userId);
};


/**
 * Get user's socket ID
 */
const getUserSocketId = (userId: string): string | undefined => {
    return connectedUsers.get(userId)
};

/**
 * Get all connected users
 */
const getConnectedUsers = (): string[] => {
    return Array.from(connectedUsers.keys());
};

export {
    initializeSocket,
    getIO,
    isUserOnline,
    getUserSocketId,
    getConnectedUsers
};