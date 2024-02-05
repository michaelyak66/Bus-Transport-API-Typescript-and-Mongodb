import moment from 'moment';
import {
  handleServerError,
  handleServerResponse,
  handleServerResponseError,
} from '../helpers/utils';
import { Request, Response } from 'express';
import { Booking } from '../models/booking';
import { Trips } from '../models/trip';

interface Seat {
  is_open: boolean;
  seat_number: number;
}

const BookingController = {
  async create(req: any, res: Response): Promise<object | void> {
    const {
      user_id, trip_id, seat_number
    } = req.body;
    try {
      const trip = await Trips.findById(trip_id);
      if (!trip) {
        return handleServerResponseError(res, 404, 'Trip not found');
      }

      const reservedSeatNumber = await checkSeatNumber(trip_id, seat_number);
      if (!reservedSeatNumber) {
        return handleServerResponseError(res, 409, 'Seat is already taken');
      }

      const newBooking = new Booking({
        user_id: user_id || req.decoded.id,
        trip_id,
        seat_number: reservedSeatNumber,
        created_date: moment().toDate(),
        modified_date: moment().toDate()
      });

      const savedBooking = await newBooking.save();
      const booking = await Booking.findById(savedBooking._id)
        .populate('user_id', 'first_name last_name email')
        .populate('trip_id', 'trip_date');

      return handleServerResponse(res, 201, booking);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getBookings(req: any, res: Response): Promise<object | void> {
    try {
      const { is_admin, user_id } = req.body;
      const id = req.decoded.id || user_id;
      const isAdmin = req.decoded.is_admin || is_admin;

      let bookingsQuery = Booking.find()
        .populate({
          path: 'user_id',
          select: 'first_name last_name email',
        })
        .populate({
          path: 'trip_id',
          select: 'trip_date',
        });

      if (!isAdmin) {
        bookingsQuery = bookingsQuery.where({ user_id: id });
      }

      const bookings = await bookingsQuery.exec();
      return handleServerResponse(res, 200, bookings);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async getOneBooking(req: Request, res: Response): Promise<object | void> {
    try {
      const { bookingId } = req.params;
      const booking = await Booking.findById(bookingId)
        .populate({
          path: 'user_id',
          select: 'first_name last_name email',
        })
        .populate({
          path: 'trip_id',
          select: 'trip_date',
        });

      if (!booking) {
        return handleServerResponseError(res, 404, 'Booking not found');
      }
      console.log(booking)
      return handleServerResponse(res, 200, booking);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async deleteBooking(req: Request, res: Response): Promise<object | void> {
    const { bookingId } = req.params;
    try {
      const deletedBooking = await Booking.findByIdAndDelete(bookingId);
      if (!deletedBooking) {
        return handleServerResponseError(res, 404, 'Booking not found');
      }
      return handleServerResponse(res, 200, { message: 'Booking deleted successfully' });
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

const reserveSeat = async (tripId: number, seatNumber: number): Promise<number | null> => {
  try {
    const trip = await Trips.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }
    const seats = trip.seats;

    if (!seats || seats.length === 0 || seatNumber < 0 || seatNumber >= seats.length) {
      throw new Error('Invalid seat number');
    }

    if (!seats[seatNumber].is_open) {
      return null; // Seat already taken
    }

    seats[seatNumber].is_open = false;
    trip.markModified('seats');
    await trip.save();

    return seatNumber;
  } catch (error) {
    console.error('Error reserving seat:', error);
    return null;
  }
};

const checkSeatNumber = async (tripId: number, seatNumber: number): Promise<number | null> => {
  try {
    if (seatNumber >= 0) {
      const reservedSeatNumber = await reserveSeat(tripId, seatNumber);
      return reservedSeatNumber;
    }

    const trip = await Trips.findById(tripId);
    if (!trip || !trip.seats || trip.seats.length === 0) {
      throw new Error('Trip or seats not found');
    }

    const availableSeat = trip.seats.find(seat => seat.is_open);
    if (!availableSeat) {
      throw new Error('No available seats');
    }

    const reservedSeatNumber = await reserveSeat(tripId, availableSeat.seat_number);
    console.log('Reserved seat number:', reservedSeatNumber);
    return reservedSeatNumber;
  } catch (error) {
    console.error('Error checking seat number:', error);
    return null;
  }
};

export default BookingController;
