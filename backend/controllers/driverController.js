const Driver = require('../models/Driver');

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const drivers = await Driver.find(filter).sort('-createdAt');
  res.json(drivers);
};

exports.create = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!driver) return res.status(404).json({ message: 'Driver not found.' });
  res.json(driver);
};

exports.remove = async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Driver not found.' });
  res.json({ message: 'Driver removed.' });
};
