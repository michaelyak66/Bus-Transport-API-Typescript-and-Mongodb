import moment from 'moment';
import db from './db';
import {
  createToken,
  // hasToken,
  hashPassword,
  // isPassword,
  handleServerError,
  handleServerResponse,
  handleServerResponseError
} from '../helpers/utils';

const Auth = {
  async create(req, res) {
    const {
      email, firstname, lastname, password, userType
    } = req.body;
    try {
      const hash = await hashPassword(password);
      const createQuery = `INSERT INTO
      Users(email, first_name, last_name, password, is_admin, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
      const values = [
        email.trim().toLowerCase(),
        firstname.trim().toLowerCase(),
        lastname.trim().toLowerCase(),
        hash,
        userType === 'admin',
        moment(new Date()),
        moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      const token = createToken(rows[0].id);
      return handleServerResponse(res, 201, {
        user_id: rows[0].id,
        is_admin: rows[0].is_admin,
        token
      });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return handleServerResponseError(res, 409, `User with Email:- ${email.trim().toLowerCase()} already exists`);
      }
      handleServerError(res, error);
    }
  }
};

export default Auth;