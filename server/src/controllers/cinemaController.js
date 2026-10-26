import { Cinema } from '../models/Cinema.js';
import { Screen } from '../models/Screen.js';

export const getCinemas = async (req, res, next) => {
  try {
    const { city, active } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      query.active = true;
    }

    if (city && city !== 'All') {
      query.city = new RegExp(city, 'i');
    }

    const cinemas = await Cinema.find(query).sort({ city: 1, name: 1 });
    const availableCities = await Cinema.distinct('city', { active: true });

    res.json({
      success: true,
      message: 'Cinemas retrieved successfully.',
      data: {
        cinemas,
        cities: availableCities,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found.',
      });
    }

    const screens = await Screen.find({ cinemaId: cinema._id });

    res.json({
      success: true,
      message: 'Cinema retrieved successfully.',
      data: {
        cinema,
        screens,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCinemaScreens = async (req, res, next) => {
  try {
    const screens = await Screen.find({ cinemaId: req.params.id });
    res.json({
      success: true,
      message: 'Screens retrieved.',
      data: { screens },
    });
  } catch (err) {
    next(err);
  }
};

export const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Cinema created successfully.',
      data: { cinema },
    });
  } catch (err) {
    next(err);
  }
};

export const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found.',
      });
    }
    res.json({
      success: true,
      message: 'Cinema updated successfully.',
      data: { cinema },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found.',
      });
    }
    // Cascade delete screens
    await Screen.deleteMany({ cinemaId: req.params.id });
    res.json({
      success: true,
      message: 'Cinema and associated screens removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const { cinemaId, name, format, seatLayout } = req.body;

    let totalSeats = 0;
    if (seatLayout && Array.isArray(seatLayout)) {
      seatLayout.forEach((row) => {
        if (row.seats) totalSeats += row.seats.length;
      });
    }

    const screen = await Screen.create({
      cinemaId,
      name,
      format,
      seatLayout,
      totalSeats,
    });

    res.status(201).json({
      success: true,
      message: 'Screen created successfully.',
      data: { screen },
    });
  } catch (err) {
    next(err);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.seatLayout && Array.isArray(updateData.seatLayout)) {
      let total = 0;
      updateData.seatLayout.forEach((row) => {
        if (row.seats) total += row.seats.length;
      });
      updateData.totalSeats = total;
    }

    const screen = await Screen.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found.',
      });
    }

    res.json({
      success: true,
      message: 'Screen updated successfully.',
      data: { screen },
    });
  } catch (err) {
    next(err);
  }
};
