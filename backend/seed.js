require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Vehicle = require('./models/Vehicle');
const Driver  = require('./models/Driver');
const Trip    = require('./models/Trip');
const Expense = require('./models/Expense');
const User    = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clear existing data (keep users)
  await Promise.all([
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    Expense.deleteMany({}),
  ]);
  console.log('🗑️  Cleared old data');

  // ── Vehicles ──────────────────────────────────────────────
  const vehicles = await Vehicle.insertMany([
    { registrationNumber: 'MH12AB1234', name: 'Thor-01',    type: 'Truck',   loadCapacityKg: 12000, odometerKm: 48200, acquisitionCost: 2200000, status: 'Available' },
    { registrationNumber: 'MH14CD5678', name: 'Titan-02',   type: 'Trailer', loadCapacityKg: 20000, odometerKm: 71540, acquisitionCost: 3800000, status: 'Available' },
    { registrationNumber: 'DL01EF9012', name: 'Viper-03',   type: 'Van',     loadCapacityKg: 3500,  odometerKm: 22800, acquisitionCost: 950000,  status: 'Available' },
    { registrationNumber: 'GJ05GH3456', name: 'Atlas-04',   type: 'Truck',   loadCapacityKg: 15000, odometerKm: 93600, acquisitionCost: 2650000, status: 'In Shop'   },
    { registrationNumber: 'KA03IJ7890', name: 'Blaze-05',   type: 'Truck',   loadCapacityKg: 10000, odometerKm: 34100, acquisitionCost: 1980000, status: 'Available' },
    { registrationNumber: 'TN09KL2345', name: 'Falcon-06',  type: 'Van',     loadCapacityKg: 2800,  odometerKm: 17500, acquisitionCost: 820000,  status: 'Available' },
  ]);
  console.log(`🚛 Seeded ${vehicles.length} vehicles`);

  // ── Drivers ───────────────────────────────────────────────
  const drivers = await Driver.insertMany([
    { name: 'Arjun Mehta',   licenseNumber: 'MH-DL-2021-0091', licenseExpiry: '2027-03-15', phone: '+91 98201 11234', safetyScore: 92, status: 'Available' },
    { name: 'Priya Sharma',  licenseNumber: 'DL-DL-2020-0445', licenseExpiry: '2026-08-20', phone: '+91 97302 22345', safetyScore: 88, status: 'Available' },
    { name: 'Ravi Kumar',    licenseNumber: 'KA-DL-2019-1123', licenseExpiry: '2025-11-30', phone: '+91 96403 33456', safetyScore: 75, status: 'Available' },
    { name: 'Sunita Patel',  licenseNumber: 'GJ-DL-2022-0788', licenseExpiry: '2028-01-10', phone: '+91 95504 44567', safetyScore: 95, status: 'Available' },
    { name: 'Deepak Singh',  licenseNumber: 'TN-DL-2020-0556', licenseExpiry: '2026-06-05', phone: '+91 94605 55678', safetyScore: 83, status: 'Available' },
    { name: 'Anita Rao',     licenseNumber: 'MH-DL-2023-0155', licenseExpiry: '2029-02-28', phone: '+91 93706 66789', safetyScore: 97, status: 'Off Duty'  },
  ]);
  console.log(`👤 Seeded ${drivers.length} drivers`);

  // ── Completed Trips ───────────────────────────────────────
  const pastTrips = await Trip.insertMany([
    {
      source: 'Mumbai', destination: 'Pune',
      vehicle: vehicles[0]._id, driver: drivers[0]._id,
      cargoWeightKg: 4500, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 5 * 86400000),
      completedAt:  new Date(Date.now() - 4 * 86400000),
    },
    {
      source: 'Delhi', destination: 'Jaipur',
      vehicle: vehicles[1]._id, driver: drivers[1]._id,
      cargoWeightKg: 9800, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 3 * 86400000),
      completedAt:  new Date(Date.now() - 2 * 86400000),
    },
    {
      source: 'Bangalore', destination: 'Chennai',
      vehicle: vehicles[2]._id, driver: drivers[2]._id,
      cargoWeightKg: 2100, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 7 * 86400000),
      completedAt:  new Date(Date.now() - 6 * 86400000),
    },
    {
      source: 'Hyderabad', destination: 'Vizag',
      vehicle: vehicles[4]._id, driver: drivers[3]._id,
      cargoWeightKg: 7300, status: 'Cancelled',
      dispatchedAt: new Date(Date.now() - 2 * 86400000),
    },
  ]);
  console.log(`🛣️  Seeded ${pastTrips.length} past trips`);

  // ── Live Running Trips ─────────────────────────────────────
  // Set vehicle/driver to On Trip for running trips
  const runningTrip = await Trip.create({
    source: 'Ahmedabad', destination: 'Surat',
    vehicle: vehicles[0]._id, driver: drivers[0]._id,
    cargoWeightKg: 6200, status: 'Running',
    dispatchedAt: new Date(Date.now() - 2 * 3600000),
  });
  await Vehicle.findByIdAndUpdate(vehicles[0]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[0]._id,   { status: 'On Trip' });

  const runningTrip2 = await Trip.create({
    source: 'Chennai', destination: 'Coimbatore',
    vehicle: vehicles[5]._id, driver: drivers[4]._id,
    cargoWeightKg: 1800, status: 'Running',
    dispatchedAt: new Date(Date.now() - 5 * 3600000),
  });
  await Vehicle.findByIdAndUpdate(vehicles[5]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[4]._id,   { status: 'On Trip' });

  console.log('🚀 Seeded 2 running trips');

  // ── Expenses ──────────────────────────────────────────────
  const allTrips = [...pastTrips, runningTrip, runningTrip2];
  const expenses = await Expense.insertMany([
    { trip: allTrips[0]._id, category: 'Fuel',   amount: 8500,  notes: 'Full tank at Lonavla' },
    { trip: allTrips[0]._id, category: 'Toll',   amount: 620,   notes: 'Mumbai-Pune expressway' },
    { trip: allTrips[1]._id, category: 'Fuel',   amount: 14200, notes: 'Two fill-ups Delhi-Jaipur' },
    { trip: allTrips[1]._id, category: 'Toll',   amount: 480,   notes: 'NH48 tolls' },
    { trip: allTrips[1]._id, category: 'Repair', amount: 3800,  notes: 'Tyre puncture repair' },
    { trip: allTrips[2]._id, category: 'Fuel',   amount: 6300,  notes: 'Fuel at Hosur' },
    { trip: allTrips[2]._id, category: 'Toll',   amount: 340,   notes: 'NICE corridor' },
    { trip: allTrips[3]._id, category: 'Fuel',   amount: 4200,  notes: 'Partial fuel — trip cancelled' },
    { trip: allTrips[3]._id, category: 'Other',  amount: 1500,  notes: 'Driver overnight stay' },
    { trip: allTrips[4]._id, category: 'Fuel',   amount: 9800,  notes: 'Running trip expense' },
    { trip: allTrips[5]._id, category: 'Fuel',   amount: 3200,  notes: 'Running trip expense' },
    { trip: allTrips[5]._id, category: 'Toll',   amount: 220,   notes: 'Chennai bypass toll' },
  ]);
  console.log(`💰 Seeded ${expenses.length} expenses`);

  // ── Demo User ─────────────────────────────────────────────
  const existingUser = await User.findOne({ email: 'admin@fleetforge.dev' });
  if (!existingUser) {
    await User.create({
      name: 'Fleet Admin',
      email: 'admin@fleetforge.dev',
      password: 'admin1234',
      role: 'Fleet Manager',
    });
    console.log('👑 Created demo user: admin@fleetforge.dev / admin1234');
  } else {
    console.log('👑 Demo user already exists');
  }

  console.log('\n✅ Seeding complete!');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
