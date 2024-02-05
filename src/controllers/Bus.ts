import moment from 'moment';
import {
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
} from '../helpers/utils';
import { Request, Response } from 'express';
import { Bus } from '../models/bus';

const BusController = {
  async create(req: Request, res: Response): Promise<Response | void> {
    const {
      model, numberPlate, manufacturer, year, capacity
    } = req.body;
    try {
      // Create a new bus document using the BusModel
      const newBus = new Bus({
        model: model.trim().toLowerCase(),
        number_plate: numberPlate.trim().toLowerCase(),
        manufacturer: manufacturer.trim().toLowerCase(),
        year,
        capacity,
        created_date: moment().toDate(),
        modified_date: moment().toDate()
      });

      // Save the new bus document to the database
      const savedBus = await newBus.save();

      return handleServerResponse(res, 201, { bus: savedBus });
    } catch (error) {
      if (error.code === 11000) { // MongoDB duplicate key error code
        return handleServerResponseError(res, 409, `Bus with number plate:- ${numberPlate.trim().toLowerCase()} already exists`);
      }
      handleServerError(res, error);
    }
  },
};

export default BusController;
