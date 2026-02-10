import mongoose from 'mongoose';

// MongoDB connection options with proper types
const mongooseOptions: mongoose.ConnectOptions = {
  // These options are now defaults in Mongoose 6+, but explicitly setting for clarity
  // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
};

/**
 * Connect to MongoDB database
 * @returns Promise that resolves when connected
 */
const connectDB = async (): Promise<void> => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI: string = process.env.MONGODB_URI || '';

    // Check if URI exists
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, mongooseOptions);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;