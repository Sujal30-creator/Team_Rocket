const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeightKg: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'On Trip', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    eta: { type: Date },
    dispatchedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
