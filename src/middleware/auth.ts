import { Request, Response, NextFunction } from "express";
import User from "@/models/user.model.js";
import { verifyAccessToken } from "@/utils/jwt.js";
import AppError from "@/utils/AppError.js";

/**
 * Protect routes - verifies JWT and attaches user to request
 * Use this on any route that requires authentication
 */
const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    // Check header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'No authentication token provided. Please login.',
        401
      );
    }

    // Extract token by removing 'Bearer ' prefix
    // 'Bearer eyJhbG...' → 'eyJhbG...'
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Invalid token format', 401);
    }

    // Verify token
    // This throws AppError if token is invalid or expired
    const decoded = verifyAccessToken(token);

    // Find user in database
    // Why check DB if JWT is valid?
    // - User might have been deleted
    // - User might have been deactivated
    // - Role might have changed since token was issued
    const user = await User.findById(decoded.id).select(
      'name email role isEmailVerified isActive isBanned banReason'
    );

    if (!user) {
      throw new AppError(
        'User no longer exists',
        401
      );
    }

    // Check account is active
    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        403
      );
    }

    // Check if user is banned
    if ( user.isBanned) {
      throw new AppError(
        `Your account has been banned. Reason: ${user.banReason || 'No reason provided'}`, 403
      );
    }
    // Attach user to request
    // Now any route after this middleware
    // can access req.user
    req.user = {
      id: (user._id as unknown as string).toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    // Proceed to next middleware or route handler
    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth - attaches user if token exists
 * but doesn't block request if no token
 * Useful for routes that work differently
 * when logged in vs logged out
 */
const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // No token? Just continue without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Try to verify - if fails, just continue
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select(
        'name email role isEmailVerified isActive isBanned'
      );

      if (user && user.isActive && !user.isBanned) {
        req.user = {
          id: (user._id as unknown as string).toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        };
      }
    } catch {
      // Token invalid? No problem, just continue without user
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to specific roles
 * MUST be used AFTER protect middleware
 *
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 * Usage: router.get('/mod', protect, authorize('admin', 'moderator'), handler)
 */
const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // req.user is guaranteed to exist here because
    // authorize() is always used after protect()
    if (!req.user) {
      next(new AppError('Not authenticated', 401));
      return;
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
      return;
    }

    // Role is allowed, proceed
    next();
  };
};

/**
 * Ensure email is verified before accessing route
 * MUST be used AFTER protect middleware
 *
 * Usage: router.get('/sensitive', protect, requireVerified, handler)
 */
const requireVerified = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  if (!req.user.isEmailVerified) {
    next(
      new AppError(
        'Please verify your email address to access this feature.',
        403
      )
    );
    return;
  }

  next();
};

/**
 * Prevent users from modifying their own role
 * MUST be used AFTER protect middleware
 *
 * Usage: router.post('/sensitive', protect, requireVerified, handler)
 */
const preventSelfRoleChange = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const targetUserId = req.params.id;
  const currentUserId = req.user?.id;

  if (targetUserId === currentUserId && req.body.role) {
    next(new AppError('You cannot change your own role', 403));
    return;
  }

  next()
}
export {
  protect,
  optionalAuth,
  authorize,
  requireVerified,
  preventSelfRoleChange
};