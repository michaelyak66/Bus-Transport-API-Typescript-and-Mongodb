import mongoose from 'mongoose';
import { logger } from '../helpers/utils';
import dotenv from 'dotenv';

dotenv.config();

// Define Booking schema
const bookingSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  trip_id: { type: String, required: true },
  seat_number: { type: Number, required: true },
  created_date: { type: Date, default: Date.now },
  modified_date: { type: Date, default: Date.now }
});

// Create Booking model
export const Booking = mongoose.model('Booking', bookingSchema);

