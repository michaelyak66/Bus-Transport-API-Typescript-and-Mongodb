import mongoose from 'mongoose';

// Define the Trip schema
const tripSchema = new mongoose.Schema({
  bus_id: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  trip_date: { type: Date },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  fare: { type: Number, required: true },
  seats: { type: [{ seat_number: Number, is_open: Boolean }], required: true },
  created_date: { type: Date, default: Date.now },
  modified_date: { type: Date, default: Date.now }
});

// Create the Trip model
export const Trips = mongoose.model('Trip', tripSchema);
