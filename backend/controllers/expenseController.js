const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

exports.list = async (req, res) => {
  const { tripId } = req.query;
  const filter = tripId ? { trip: tripId } : {};
  const expenses = await Expense.find(filter).populate('trip').sort('-createdAt');
  res.json(expenses);
};

exports.create = async (req, res) => {
  try {
    const { trip, category, amount, notes } = req.body;
    const tripDoc = await Trip.findById(trip);
    if (!tripDoc) return res.status(404).json({ message: 'Trip not found.' });

    const expense = await Expense.create({ trip, category, amount, notes });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Total cost for a single trip — fuel + toll + repair + other
exports.tripTotal = async (req, res) => {
  const expenses = await Expense.find({ trip: req.params.tripId });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  res.json({ total, byCategory });
};
