import moment from 'moment';
import db from './db';
import {
  handleServerError,
  handleServerResponse,
  logger
} from '../helpers/utils';
import { Trips } from '../models/trip';


/**
 * @function getBus
 * @param {number} id id of bus
 * @returns {Promise<object>} object containing bus details
 */
const getBus = async (id: number): Promise<object | null> => {
  try {
    const bus = await Trips.findOne({ id: id }); // Assuming Trip is a MongoDB model
    return bus;
  } catch (error) {
    return error;
  }
};

/**
 * @function createSeats
 * @param {number} busCapacity capacity of bus
 * @returns {Array<object>} array of objects containing seat number and seat status
 */
const createSeats = (busCapacity: number): Array<object> => {
  const seats = new Array(busCapacity).fill(0).map((seat, index) => ({
    is_open: true,
    seat_number: index + 1
  }));
  return seats;
};

const Trip = {
  /**
   * @method create
   * @param {object} req request object
   * @param {object} res response object
   * @returns {Promise<object>} response object
   */



  async  create(req: any, res: any): Promise<object> {
    const {
      bus_id, origin, destination, trip_date, fare
    } = req.body;
    try {
      const bus: any = await getBus(bus_id);
      const seats = createSeats(bus ? bus.capacity : 7);
      logger().info(seats, bus);

      const newTrip = new Trips({
        bus_id,
        origin: origin.trim().toLowerCase(),
        destination: destination.trim().toLowerCase(),
        trip_date: moment(trip_date),
        fare,
        seats,
        created_date: moment(),
        modified_date: moment()
      });

      const savedTrip = await newTrip.save();
      return handleServerResponse(res, 201, savedTrip);
    } catch (error) {
      return handleServerError(res, error);
    }
},  

  /**
   * @method getTrips
   * @param {object} req request object
   * @param {object} res response object
   * @returns {Promise<object>} response object
   */


  async  getTrips(req: any, res: any): Promise<object> {
    try {
      const trips = await Trips.find({});
      return handleServerResponse(res, 200, trips);
    } catch (error) {
      return handleServerError(res, error);
    }
  },
  /**
   * @method getTrips
   * @param {object} req request object
   * @param {object} res response object
   * @returns {Promise<object>} response object
   */



  async  getOneTrip(req: any, res: any): Promise<object> {
    try {
      const { tripId } = req.params;
      console.log(tripId)
      const trip = await Trips.findById(tripId);
      return handleServerResponse(res, 200, trip);
    } catch (error) {
      return handleServerError(res, error);
    }
},
  /**
   * @method cancelTrip
   * @param {object} req request object
   * @param {object} res response object
   * @returns {Promise<object>} response object
   */


  async  cancelTrip(req: any, res: any): Promise<object> {
    try {
      const { tripId } = req.params;
      const updatedTrip = await Trips.findByIdAndUpdate(tripId, { status: 'cancelled' }, { new: true });
      if (updatedTrip) {
          return handleServerResponse(res, 200, { message: 'Trip cancelled successfully' });
      } else {
          return handleServerResponse(res, 404, { message: 'Trip not found' });
      }
    } catch (error) {
      return handleServerError(res, error);
    }
}
};

export default Trip;
