const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Truck', 'Van', 'Trailer'], default: 'Truck' },
    loadCapacityKg: { type: Number, required: true, min: 0 },
    odometerKm: { type: Number, default: 0, min: 0 },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
