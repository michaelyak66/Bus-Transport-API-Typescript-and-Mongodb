import mongoose from 'mongoose';

interface UserDocument extends mongoose.Document {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_admin: boolean;
  created_date: Date;
  modified_date: Date;
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  created_date: { type: Date, default: Date.now },
  modified_date: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
