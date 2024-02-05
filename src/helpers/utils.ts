import bunyan from 'bunyan';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../controllers/db';
import { Request, Response, NextFunction } from 'express';
import { Trips } from '../models/trip'; // Assuming you have a Trip model defined
import { UserModel } from '../models/user'; // Assuming you have a User model
import { Console } from 'console';



dotenv.config();

export const logger = () => {
  const log = bunyan.createLogger({ name: 'myapp' });
  return log;
};

/**
 * @param response response object from server
 * @param status error message
 * @param data meta-data
 * @returns error response
 */
export const handleServerResponse = (res: Response, status: number, data: {}|[]): Response => {
    return res.status(status).json({
      status: 'success',
      data
    });
  };

/**
 * Handles server error.
 * @param res Response object
 * @param error Error object
 * @returns Response object
 */
export const handleServerError = (res: Response, error: Error): Response => {
  logger().error(error);
  return res.status(500).send({
    status: 'error',
    error: 'Internal Server Error'
  });
};


export const handleServerResponseError = (res: Response, status: number, message: string) => {
    logger().error(message);
    return res.status(status).send({
      status: 'error',
      error: message
    });
  };

/**
 * Hashes a password with bcrypt.
 * @param password Password to be hashed
 * @returns Password hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = process.env.SALT;
  const hash = await bcrypt.hash(password, parseInt(saltRounds, 10));
  return hash;
};

/**
 * Checks if a password corresponds with saved hash in db.
 * @param password Plain password
 * @param hash Password hash
 * @returns True if correct or false if incorrect
 */
export const isPassword = (password: string, hash: string): boolean => bcrypt.compareSync(password, hash);

/**
 * Creates new JWT token for authentication.
 * @param id User id
 * @param isAdmin Whether user is an admin
 * @returns Newly created JWT
 */
export const createToken = (id: number, isAdmin: boolean): string => {
  const token = jwt.sign(
    { id, isAdmin },
    process.env.SECRET,
    { expiresIn: '7d' }
  );
  return token;
};

interface JwtPayload {
    id: number;
    isAdmin: boolean;
  }
/**
 * Checks if user has a valid token.
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns Response object
 */

export const hasToken = async (req: any, res: Response, next: NextFunction): Promise<Response | void> => {
  const token = req.body.token || req.headers['x-access-token'] || req.headers.authorization || req.body.authorization;
  try {
    if (token) {
      const noBearer = token.replace(/Bearer\s/gi, '');
      const decoded = jwt.verify(noBearer, process.env.SECRET) as JwtPayload;
      logger().info(decoded);
      console.log(decoded);
      

      const user = await UserModel.findById(decoded.id); // Assuming you have a User model with findById method
      if (!user) {
        return handleServerResponseError(res, 403, 'Token you provided is invalid');
      }
      req.decoded = decoded;
      return next();
    }
    return handleServerResponseError(res, 403, 'You have to be logged in');
  } catch (error) {
    return handleServerResponseError(res, 403, error.message);
  }
};



// export const hasTtoken = async (req: any, res: Response, next: NextFunction): Promise<Response | void> => {
//   const token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization || req.body.Authorization;
//   try {
//     if (token) {
//       const noBearer = token.replace(/Bearer\s/gi, '');
//       const decoded = jwt.verify(noBearer, process.env.SECRET) as JwtPayload;
//       const text = 'SELECT * FROM Users WHERE id = $1';
//       const { rows } = await db.query(text, [decoded.id]);
//       if (!rows[0]) {
//         return handleServerResponseError(res, 403, 'Token you provided is invalid');
//       }
//       req.decoded = decoded;
//       return next();
//     }
//     return handleServerResponseError(res, 403, 'You have to be logged in');
//   } catch (error) {
//     return handleServerResponseError(res, 403, error);
//   }
// };

/**
 * Checks if seat number is valid.
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns Response object
 */

export const checkSeatNumber = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { trip_id, seat_number } = req.body;

  try {
    if (!seat_number) {
      return next();
    }

    // const trip = await Trips.findById(trip_id);
    const trip = await Trips.findOne(
      { _id: trip_id }, // Match document by _id
      { seats: { $elemMatch: { seat_number: seat_number } } } // Project fields and filter seats array
    )
    
    console.log(trip)

    if (!trip) {
      return handleServerResponseError(res, 404, `Trip with id ${trip_id} not found`);
    }

    // const isSeatOpen = trip[0].seats.is_open;
    const seat = trip.seats.find(seat => seat.seat_number === seat_number);


    if (seat.is_open === false) {
      return handleServerResponseError(res, 409, `Seat ${seat_number} already taken, please select another`);
    }

    return next();
  } catch (error) {
    return handleServerError(res, error);
  }
};



// export const checkSeatNumber = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
//   const { trip_id, seat_number } = req.body;
//   const tripQuery = `SELECT id, seats [${seat_number}]
//   FROM Trips
//   WHERE id = $1`;
//   const value = [trip_id];
//   try {
//     if (seat_number) {
//       const { rows } = await db.query(tripQuery, value);
//       console.log(rows[0]);
//       if (rows[0].seats.is_open === false) {
//         return handleServerResponseError(res, 409, `seat_number ${seat_number} already taken, please select another`);
//       }
//       return next();
//     }
//     return next();
//   } catch (error) {
//     return handleServerError(res, error);
//   }
// };



/**
 * Checks if user is an admin.
 * @param req Request object
 * @param res Response object
 * @param next Next function
 * @returns Response object
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const token = req.body.token || req.headers['x-access-token'] || req.headers.Authorization;
  try {
    const noBearer = token.replace(/Bearer\s/gi, '');
    const decoded = await jwt.verify(noBearer, process.env.SECRET) as JwtPayload;
    if(!decoded){
      return handleServerResponseError(res, 403, 'You are not authorized to access this endpoint');
    }
    if (req.body.is_admin) {
      return next();
    }
    if (!decoded.isAdmin) {
      return handleServerResponseError(res, 403, 'You are not authorized to access this endpoint');
    }
    logger().info('ahhhhhhhhhhhhhhhhtttttttttttttttttttttttttttttttttthhhhhhhhhhhhhhhhhhh');

    return next();
  } catch (error) {
    logger().info('ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');

    return handleServerResponseError(res, 403, error);
  }
};


  