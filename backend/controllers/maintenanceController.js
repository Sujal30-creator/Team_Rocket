const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

exports.list = async (req, res) => {
  const logs = await MaintenanceLog.find().populate('vehicle').sort('-createdAt');
  res.json(logs);
};

// Send a vehicle to the shop — it becomes unavailable for trip dispatch
exports.start = async (req, res) => {
  const { vehicleId, description } = req.body;
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found.' });
  if (vehicle.status === 'On Trip') {
    return res.status(400).json({ message: `${vehicle.name} is on a trip and cannot be sent for maintenance yet.` });
  }

  const log = await MaintenanceLog.create({ vehicle: vehicleId, description: description || 'Scheduled service' });
  vehicle.status = 'In Shop';
  await vehicle.save();

  res.status(201).json(log);
};

// Complete maintenance — vehicle becomes Available again
exports.complete = async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);
  if (!log) return res.status(404).json({ message: 'Maintenance log not found.' });

  log.status = 'Completed';
  log.completedAt = new Date();
  if (req.body.cost !== undefined) log.cost = req.body.cost;
  await log.save();

  await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
  res.json(log);
};
