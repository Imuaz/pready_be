import bcrypt from "bcryptjs";
import User from "@/models/user.model.js";
import type { IUser, RegisterData, RegisterResult } from "@/types/type.js";
import AppError from "@/utils/AppError.js";


/**
 * Register a new user
 * @param data - Registration data
 * @returns Created user data (without password)
 */
const registerUser = async (data: RegisterData): Promise<RegisterResult> => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Hash the password
  const hashedPassword: string = await bcrypt.hash(password, parseInt(process.env.SALTROUNDS || '10', 10));

  // Create new user in database
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  // Return user without password
  // We use 'as' since we know password is excluded
  return {
    user: user as Omit<IUser, 'password'>
  };
};

/**
 * Verify a password against its hash
 * @param plainPassword - Password to verify
 * @param hashedPassword - Hash to verify against
 * @returns Boolean indicating match
 */
const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { registerUser, verifyPassword };