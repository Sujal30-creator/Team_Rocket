const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const trips = await Trip.find(filter).populate('vehicle').populate('driver').sort('-createdAt');
  res.json(trips);
};

// Dispatch a trip: validates and atomically flips vehicle + driver to "On Trip"
exports.dispatch = async (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeightKg } = req.body;
  if (!source || !destination || !vehicleId || !driverId || !cargoWeightKg) {
    return res.status(400).json({ message: 'Source, destination, vehicle, driver, and cargo weight are all required.' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const vehicle = await Vehicle.findById(vehicleId).session(session);
    const driver = await Driver.findById(driverId).session(session);
    if (!vehicle) throw new Error('Vehicle not found.');
    if (!driver) throw new Error('Driver not found.');

    if (vehicle.status !== 'Available') {
      throw new Error(`${vehicle.name} is not available (currently: ${vehicle.status}).`);
    }
    if (driver.status !== 'Available') {
      throw new Error(`${driver.name} is not available (currently: ${driver.status}).`);
    }
    if (!driver.hasValidLicense()) {
      throw new Error(`${driver.name}'s license has expired and cannot be assigned.`);
    }
    if (cargoWeightKg > vehicle.loadCapacityKg) {
      throw new Error(`Cargo weight ${cargoWeightKg}kg exceeds ${vehicle.name}'s capacity of ${vehicle.loadCapacityKg}kg.`);
    }

    const [trip] = await Trip.create(
      [{ source, destination, vehicle: vehicleId, driver: driverId, cargoWeightKg, status: 'Running' }],
      { session }
    );

    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    await vehicle.save({ session });
    await driver.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// Complete or cancel a trip: restores vehicle + driver to "Available"
exports.finish = async (req, res) => {
  const { id } = req.params;
  const { outcome } = req.body; // "Completed" | "Cancelled"
  if (!['Completed', 'Cancelled'].includes(outcome)) {
    return res.status(400).json({ message: 'Outcome must be Completed or Cancelled.' });
  }

  const trip = await Trip.findById(id);
  if (!trip) return res.status(404).json({ message: 'Trip not found.' });
  if (trip.status !== 'Running') {
    return res.status(400).json({ message: 'Only a running trip can be completed or cancelled.' });
  }

  trip.status = outcome;
  trip.completedAt = new Date();
  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
  await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });

  const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
  res.json(populated);
};
