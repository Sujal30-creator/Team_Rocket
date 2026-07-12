const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');

exports.fleetUtilization = async (req, res) => {
  const vehicles = await Vehicle.find();
  const total = vehicles.length || 1;
  const byStatus = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});
  const utilizationPct = Math.round(((byStatus['On Trip'] || 0) / total) * 100);
  res.json({ total: vehicles.length, byStatus, utilizationPct });
};

exports.operationalCost = async (req, res) => {
  const expenses = await Expense.find();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  res.json({ total, byCategory });
};

exports.dashboardSummary = async (req, res) => {
  const [vehicles, drivers, runningTrips] = await Promise.all([
    Vehicle.find(),
    Driver.find(),
    Trip.countDocuments({ status: { $in: ['Dispatched', 'On Trip'] } }),
  ]);

  res.json({
    activeVehicles: vehicles.filter((v) => v.status !== 'In Shop' && v.status !== 'Retired').length,
    availableVehicles: vehicles.filter((v) => v.status === 'Available').length,
    vehiclesInShop: vehicles.filter((v) => v.status === 'In Shop').length,
    driversOnDuty: drivers.filter((d) => d.status !== 'Off Duty' && d.status !== 'Suspended').length,
    tripsRunning: runningTrips,
    fleetUtilizationPct: vehicles.length
      ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100)
      : 0,
  });
};
