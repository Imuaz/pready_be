export interface CustomError extends Error {
    statusCode?: number;
};

export interface RegisterBody {
    email: string;
    password: string;
    name: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

// User profile interface
export interface UserProfile {
    id: number;
    name: string;
    email: string;
}

// Update profile request body
export interface UpdateProfileBody {
    name?: string;
    email?: string;
}