const Vehicle = require('../models/Vehicle');

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const vehicles = await Vehicle.find(filter).sort('-createdAt');
  res.json(vehicles);
};

exports.create = async (req, res) => {
  try {
    const { registrationNumber } = req.body;
    const existing = await Vehicle.findOne({ registrationNumber: registrationNumber?.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: `Registration number ${registrationNumber} is already in use.` });
    }
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  res.json(vehicle);
};

exports.remove = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  res.json({ message: 'Vehicle removed.' });
};
