import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { handleServerResponseError } from './utils';

interface ValidationObject {
  [key: string]: string | number | boolean;
}

/**
 * @function
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description validates signup input
 * @returns {Response | NextFunction} error or next function
 */
const signupInput = (req: Request, res: Response, next: NextFunction): Response | NextFunction => {
  const { first_name, last_name, email, password }: ValidationObject = req.body;
  const schema = Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).required()
  });

  const validationObject: ValidationObject = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password
  };

  const result = schema.validate(validationObject);

  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
    next();
};

/**
 * @function
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description validates signin input
 * @returns {Response | NextFunction} error or next function
 */
const signinInput = (req: Request, res: Response, next: NextFunction): Response | NextFunction => {
  const { email, password }: ValidationObject = req.body;
  const schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).required()
  });

  const validationObject: ValidationObject = {
    email: req.body.email,
    password: req.body.password
  };

  const result = schema.validate(validationObject);

  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
  next();
};

/**
 * @function
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description validates create bus input
 * @returns {Response | NextFunction} error or next function
 */
const createBusInput = (req: Request, res: Response, next: NextFunction): Response | NextFunction => {
  const { model, manufacturer, year, numberPlate, capacity }: ValidationObject = req.body;
  const schema = Joi.object().keys({
    model: Joi.string().required(),
    manufacturer: Joi.string().required(),
    year: Joi.string().trim().required(),
    numberPlate: Joi.string().required(),
    capacity: Joi.number().required()
  });

  const validationObject: ValidationObject = {
    model: req.body.model,
    manufacturer: req.body.manufacturer,
    year: req.body.year,
    numberPlate: req.body.numberPlate,
    capacity: req.body.capacity
  };

  const result = schema.validate(validationObject);

  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
   next();
};

/**
 * @function
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description validates create trip input
 * @returns {Response | NextFunction} error or next function
 */
const createTripInput = (req: Request, res: Response, next: NextFunction): Response | NextFunction => {
  const { bus_id, origin, destination, trip_date, fare }: ValidationObject = req.body;
  const schema = Joi.object().keys({
    bus_id: Joi.number().required(),
    origin: Joi.string().required(),
    destination: Joi.string().trim().required(),
    trip_date: Joi.string().required(),
    fare: Joi.number().required()
  });

  const validationObject: ValidationObject = {
    bus_id: req.body.bus_id,
    origin: req.body.origin,
    destination: req.body.destination,
    trip_date: req.body.trip_date,
    fare: req.body.fare
  };

  const result = schema.validate(validationObject);

  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
   next();
};

/**
 * @function
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @description validates create booking input
 * @returns {Response | NextFunction} error or next function
 */
const createBookingInput = (req: Request, res: Response, next: NextFunction): Response | NextFunction => {
  const { trip_id }: ValidationObject = req.body;
  const schema = Joi.object().keys({
    trip_id: Joi.string().required(),
  });

  const result = schema.validate({ trip_id: req.body.trip_id });

  if (result.error) {
    return handleServerResponseError(res, 401, result.error.details[0].message);
  }
   next();
};

export default {
  validateSignup: signupInput,
  validateSignin: signinInput,
  validateCreateBus: createBusInput,
  validateCreateTrip: createTripInput,
  validateCreateBooking: createBookingInput
};
