// Augment Express's Request interface globally
// This means EVERY Request object in the entire app
// will have an optional 'user' property

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        isEmailVerified: boolean;
      };
      apiKey?: {
        id: string;
        name: string;
        permissions: string[];
      };
    }
  }
}

// This file has no imports/exports by default
// This empty export makes TypeScript treat it as a module
export {};