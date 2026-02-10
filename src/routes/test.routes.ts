import express, { Request, Response } from 'express';
import User from '@/models/user.model.js';

const router = express.Router();

// @route   POST /api/test/create-user
// @desc    Test creating a user
// @access  Public (just for testing)
router.post('/create-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists'
      });
      return;
    }

    // Create user (password will be hashed in next lesson)
    const user = await User.create({
      name,
      email,
      password // We'll hash this in Lesson 4
    });

    // Return user without password
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    });
  }
});

// @route   GET /api/test/users
// @desc    Get all users
// @access  Public (just for testing)
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Find all users (password is excluded by default due to select: false)
    const users = await User.find();

    res.json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    });
  }
});

export default router;