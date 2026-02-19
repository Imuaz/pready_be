import mongoose, { Schema, Model } from "mongoose";
import type { IUser } from "@/types/user.js";
import type { IRefreshToken } from "@/types/common.js";


// Refresh token subdocument schema
const RefreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});


// Main User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    verificationTokenExpire: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpire: {
      type: Date,
      select: false
    },
    // Array of refresh tokens
    // Supports multiple devices!
    refreshTokens: {
      type: [RefreshTokenSchema],
      default: [],
      select: false
    },
    lastLogin: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isBanned: {
      type: Boolean,
      default: false
    },
    banReason: String,
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    bannedAt: Date,
    profileImage: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes for better query performance
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1, isBanned: 1});
UserSchema.index({ 'refreshTokens.token': 1 });

// Virtual for full name display (example)
UserSchema.virtual('displayName').get(function() {
  return this.name;
});

// Export the model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;