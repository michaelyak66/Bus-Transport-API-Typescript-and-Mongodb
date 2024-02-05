import moment from 'moment';
import {
  createToken,
  hashPassword,
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
  isPassword
} from '../helpers/utils';
import { Request, Response } from 'express';
import { UserModel } from '../models/user';
interface UserRequestBody {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  userType: string;
}

const Auth = {
  async create(req: Request, res: Response): Promise<Response | void> {
    const {
      email, first_name, last_name, password, userType
    }: UserRequestBody = req.body;
    try {
      const hashedPassword = await hashPassword(password);

      // Create a new user document using the UserModel
      const newUser = new UserModel({
        email: email.trim().toLowerCase(),
        first_name: first_name.trim().toLowerCase(),
        last_name: last_name.trim().toLowerCase(),
        password: hashedPassword,
        is_admin: userType === 'admin',
        created_date: moment().toDate(),
        modified_date: moment().toDate()
      });

      // Save the new user document to the database
      const savedUser = await newUser.save();
      const token = createToken(savedUser.id, savedUser.is_admin);

      return handleServerResponse(res, 201, {
        user_id: savedUser.id,
        is_admin: savedUser.is_admin,
        token
      });
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error code
        return handleServerResponseError(res, 409, `User with Email:- ${email.trim().toLowerCase()} already exists`);
      }
      handleServerError(res, error);
    }
  },

  async login(req: Request, res: Response): Promise<Response | void> {
    const { email, password } = req.body;
    try {
      // Find the user document by email
      const user = await UserModel.findOne({ email: email.trim().toLowerCase() });

      if (!user) {
        return handleServerResponseError(res, 404, 'Account with Email not found');
      }

      if (!isPassword(password, user.password)) {
        return handleServerResponseError(res, 403, 'Password incorrect');
      }

      // Create token for the user
      const token = createToken(user.id, user.is_admin);

      return handleServerResponse(res, 200, {
        user_id: user.id,
        is_admin: user.is_admin,
        token
      });
    } catch (error) {
      return handleServerError(res, error);
    }
  },
};

export default Auth;
