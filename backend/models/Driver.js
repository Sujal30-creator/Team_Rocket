const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    phone: { type: String, trim: true },
    safetyScore: { type: Number, default: 80, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

driverSchema.methods.hasValidLicense = function () {
  return this.licenseExpiry >= new Date();
};

module.exports = mongoose.model('Driver', driverSchema);
