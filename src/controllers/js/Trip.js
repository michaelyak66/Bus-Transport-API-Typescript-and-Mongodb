/* eslint-disable camelcase */
import moment from 'moment';
import db from '../db';
import {
  handleServerError,
  handleServerResponse
} from '../../helpers/utils';

/**
 * @function getBus
 * @param {number} id id of bus
 * @returns {object} object containing bus details
 */
const getBus = async (id) => {
  const busQuery = 'SELECT * FROM Buses WHERE id = $1';
  try {
    const { rows } = await db.query(busQuery, [id]);
    return rows[0];
  } catch (error) {
    return error;
  }
};

/**
 * @function createSeats
 * @param {number} busCapacity capacity of bus
 * @returns {array} array of objects containing seat number and seat status
 */
const createSeats = (busCapacity) => {
  const seats = new Array(busCapacity).fill(0).map((seat, index) => (JSON.stringify({
    is_open: true,
    seat_number: index + 1
  })));
  return seats;
};

const Trip = {
  /**
   * @method create
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async create(req, res) {
    const {
      bus_id, origin, destination, trip_date, fare
    } = req.body;
    try {
      const createQuery = `INSERT INTO
      Trips(bus_id, origin, destination, trip_date, fare, seats, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
      const bus = await getBus(bus_id);
      const values = [
        bus_id, origin.trim().toLowerCase(),
        destination.trim().toLowerCase(), moment(trip_date),
        fare, createSeats(bus ? bus.capacity : 7),
        moment(new Date()), moment(new Date())
      ];
      const { rows } = await db.query(createQuery, values);
      return handleServerResponse(res, 201, rows[0]);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  /**
   * @method getTrips
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async getTrips(req, res) {
    try {
      const findAllQuery = 'SELECT * FROM Trips';
      const { rows } = await db.query(findAllQuery);
      return handleServerResponse(res, 200, rows);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  /**
   * @method getTrips
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async getOneTrip(req, res) {
    console.log(req.params)

    try {
      const { tripId } = req.params;
      const findAllQuery = 'SELECT * FROM trips WHERE id = $1';
      const { rows } = await db.query(findAllQuery, [tripId]);
      return handleServerResponse(res, 200, rows[0]);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  /**
   * @method cancelTrip
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} response object
   */
  async cancelTrip(req, res) {
    try {
      const { tripId } = req.params;
      const findAllQuery = 'UPDATE Trips SET status = $2 WHERE id = $1 returning *';
      await db.query(findAllQuery, [tripId, 'cancelled']);
      return handleServerResponse(res, 200, { message: 'Trip cancelled successfully' });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

export default Trip;
