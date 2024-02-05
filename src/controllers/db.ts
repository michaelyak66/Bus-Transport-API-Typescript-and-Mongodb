import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Access MONGODB_URL after loading environment variables
console.log("MONGODB_URL:", process.env.DATABASE_URL);

/**
 * Function to connect to MongoDB database using Mongoose
 * @returns {Promise<Connection>} Mongoose connection object
 */
export const connectToDatabase = async (): Promise<Connection> => {
  try {
    const db = await mongoose.connect(process.env.DATABASE_URL as string);
    mongoose.set('strictQuery', false);
    console.log('Connected to MongoDB');
    return db.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectToDatabase;
