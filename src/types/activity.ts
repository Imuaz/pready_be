/**
 * Activity-related types
 */

import mongoose, { Document } from "mongoose";

// Activity model interface
export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetUser?: mongoose.Types.ObjectId;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Activity action types
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset'
  | 'email_verified'
  | 'profile_updated'
  | 'user_banned'
  | 'user_unbanned'
  | 'role_changed'
  | 'user_deleted';

// Interface for creating activity log
export interface CreateActivityParams {
  userId: string;
  action: ActivityAction;
  targetUserId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Interface for querying activity logs
export interface GetActivitiesQuery {
  userId?: string;
  action?: ActivityAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
