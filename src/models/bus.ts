import mongoose from 'mongoose';

// Define the Bus schema
const busSchema = new mongoose.Schema({
  number_plate: { type: String, unique: true, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  capacity: { type: Number },
  created_date: { type: Date, default: Date.now },
  modified_date: { type: Date, default: Date.now }
});

// Create the Bus model
export const Bus = mongoose.model('Bus', busSchema);
