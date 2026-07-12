const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status: { $in: status.split(',') } } : {};
  const trips = await Trip.find(filter).populate('vehicle').populate('driver').sort('-createdAt');
  res.json(trips);
};

// Create a trip in Draft mode
exports.dispatch = async (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeightKg } = req.body;
  if (!source || !destination || !vehicleId || !driverId || !cargoWeightKg) {
    return res.status(400).json({ message: 'Source, destination, vehicle, driver, and cargo weight are all required.' });
  }

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    const driver = await Driver.findById(driverId);
    if (!vehicle) throw new Error('Vehicle not found.');
    if (!driver) throw new Error('Driver not found.');
    if (vehicle.status !== 'Available') throw new Error(`${vehicle.name} is not available.`);
    if (driver.status !== 'Available') throw new Error(`${driver.name} is not available.`);
    if (!driver.hasValidLicense()) throw new Error(`${driver.name}'s license has expired.`);
    if (cargoWeightKg > vehicle.loadCapacityKg) throw new Error(`Cargo exceeds vehicle capacity.`);

    const trip = await Trip.create({ 
      source, 
      destination, 
      vehicle: vehicleId, 
      driver: driverId, 
      cargoWeightKg, 
      status: 'Draft' 
    });

    const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Advance or cancel a trip
exports.finish = async (req, res) => {
  const { id } = req.params;
  const { outcome } = req.body; // "Dispatched", "On Trip", "Completed", "Cancelled"
  if (!['Dispatched', 'On Trip', 'Completed', 'Cancelled'].includes(outcome)) {
    return res.status(400).json({ message: 'Invalid outcome.' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const trip = await Trip.findById(id).session(session);
    if (!trip) throw new Error('Trip not found.');
    
    // Status machine
    if (outcome === 'Dispatched') {
      trip.status = 'Dispatched';
      trip.dispatchedAt = new Date();
      // ETA is exactly 4 hours from dispatch
      trip.eta = new Date(Date.now() + 4 * 60 * 60 * 1000);
      
      // Lock vehicle/driver immediately so they can't be assigned elsewhere
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'On Trip' }, { session });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'On Trip' }, { session });
    } 
    else if (outcome === 'On Trip') {
      trip.status = 'On Trip';
    } 
    else if (outcome === 'Completed' || outcome === 'Cancelled') {
      trip.status = outcome;
      if (outcome === 'Completed') trip.completedAt = new Date();
      
      // Free up resources and update vehicle location if completed
      const updatePayload = { status: 'Available' };
      if (outcome === 'Completed') updatePayload.currentLocation = trip.destination;
      
      await Vehicle.findByIdAndUpdate(trip.vehicle, updatePayload, { session });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }, { session });
    }

    await trip.save({ session });
    await session.commitTransaction();
    session.endSession();

    const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// Edit a Draft Trip's Address
exports.update = async (req, res) => {
  const { id } = req.params;
  const { source, destination } = req.body;

  try {
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can have their addresses updated.' });
    }

    if (source) trip.source = source;
    if (destination) trip.destination = destination;

    await trip.save();
    const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a Trip
exports.remove = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const trip = await Trip.findById(id).session(session);
    if (!trip) throw new Error('Trip not found.');

    // If it's dispatched or on trip, we must free the driver and vehicle
    if (['Dispatched', 'On Trip'].includes(trip.status)) {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' }, { session });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }, { session });
    }

    await Trip.findByIdAndDelete(id, { session });
    
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Trip permanently deleted.' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// Get Single Trip Detail
exports.getById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
