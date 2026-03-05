/**
 * @module config/socket
 * @description Socket.io server setup, authentication middleware, and connection management.
 *
 * Users are authenticated via a JWT passed in `socket.handshake.auth.token`.
 * Each connected user joins a personal room (`user:<userId>`) so that targeted
 * notifications can be emitted without broadcasting to all clients.
 */
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "@/utils/jwt.js";


/** Extends {@link Socket} with the authenticated user data attached by the auth middleware. */
interface AuthenticatedSocket extends Socket {
    userId: string;
    userEmail: string;
}

/** Map of userId → socketId for all currently connected users. */
const connectedUsers = new Map<string, string>();

let io: SocketIOServer;


/**
 * Bootstrap the Socket.io server on top of an existing HTTP server.
 *
 * Attaches an authentication middleware that verifies the bearer JWT sent
 * in `socket.handshake.auth.token`. Authenticated sockets join the room
 * `user:<userId>` for targeted delivery.
 *
 * @param httpServer - The Node.js HTTP server instance (created by `http.createServer`).
 * @returns The initialised {@link SocketIOServer} instance.
 */
// Mirror the same origin allow-list used by HTTP CORS in server.ts
const rawSocketOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedSocketOrigins = rawSocketOrigins.split(',').map((o) => o.trim()).filter(Boolean);

const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedSocketOrigins,
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });


    // ── Authentication middleware ───────────────────────────────────────────────
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token as string | undefined;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            const decoded = verifyAccessToken(token);

            const authed = socket as AuthenticatedSocket;
            authed.userId = decoded.id;
            authed.userEmail = decoded.email;

            next();
        } catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Authentication failed"));
        }
    });


    // ── Connection handler ─────────────────────────────────────────────────────
    io.on("connection", (rawSocket: Socket) => {
        const socket = rawSocket as AuthenticatedSocket;
        const { userId, userEmail } = socket;

        console.log(`User connected: ${userEmail} (${socket.id})`);

        // Store connection and join personal room
        connectedUsers.set(userId, socket.id);
        socket.join(`user:${userId}`);

        socket.emit("connected", {
            message: "Connected to notification server",
            userId,
        });

        // ── Disconnect ───────────────────────────────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userEmail} (${socket.id})`);
            connectedUsers.delete(userId);
        });

        // ── Mark notification as read (client-side trigger) ──────────────────────
        socket.on("mark-read", (notificationId: string) => {
            // Actual DB update is handled via the REST endpoint (POST /notifications/:id/read).
            // This event is available as a convenience hook for client implementations
            // that prefer a WebSocket-only flow.
            console.log(`Mark-read event received for notification: ${notificationId}`);
        });

        // ── Typing indicators (bonus feature) ────────────────────────────────────
        socket.on("typing", (data: { room: string }) => {
            socket.to(data.room).emit("user-typing", { userId, userEmail });
        });

        socket.on("stop-typing", (data: { room: string }) => {
            socket.to(data.room).emit("user-stop-typing", { userId, userEmail });
        });
    });

    return io;
};


/**
 * Returns the active {@link SocketIOServer} instance.
 *
 * @throws {Error} If called before {@link initializeSocket}.
 * @returns The active Socket.io server.
 */
const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error("Socket.io not initialized. Call initializeSocket() first.");
    }
    return io;
};


/**
 * Checks whether a user currently has an active WebSocket connection.
 *
 * @param userId - The user's MongoDB ObjectId string.
 * @returns `true` if the user is connected, `false` otherwise.
 */
const isUserOnline = (userId: string): boolean => connectedUsers.has(userId);


/**
 * Returns the Socket.io socket ID for a connected user.
 *
 * @param userId - The user's MongoDB ObjectId string.
 * @returns The socket ID string, or `undefined` if the user is not connected.
 */
const getUserSocketId = (userId: string): string | undefined => connectedUsers.get(userId);


/**
 * Returns the list of user IDs that currently have an active connection.
 *
 * @returns An array of MongoDB ObjectId strings.
 */
const getConnectedUsers = (): string[] => Array.from(connectedUsers.keys());


export {
    initializeSocket,
    getIO,
    isUserOnline,
    getUserSocketId,
    getConnectedUsers,
};