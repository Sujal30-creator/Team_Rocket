require('dotenv').config();
const mongoose = require('mongoose');

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
    { registrationNumber: 'WB01MN1122', name: 'Rhino-07',   type: 'Truck',   loadCapacityKg: 14000, odometerKm: 56000, acquisitionCost: 2400000, status: 'Available' },
    { registrationNumber: 'UP32OP4455', name: 'Eagle-08',   type: 'Van',     loadCapacityKg: 4000,  odometerKm: 12400, acquisitionCost: 1100000, status: 'Available' },
    { registrationNumber: 'MP04QR6677', name: 'Mammoth-09', type: 'Trailer', loadCapacityKg: 25000, odometerKm: 102400, acquisitionCost: 4500000, status: 'Retired' },
    { registrationNumber: 'RJ14ST8899', name: 'Cheetah-10', type: 'Van',     loadCapacityKg: 3000,  odometerKm: 8500,  acquisitionCost: 900000,  status: 'Available' },
    { registrationNumber: 'KL01UV2233', name: 'Goliath-11', type: 'Truck',   loadCapacityKg: 16000, odometerKm: 41200, acquisitionCost: 2800000, status: 'In Shop' },
    { registrationNumber: 'HR26WX5566', name: 'Comet-12',   type: 'Trailer', loadCapacityKg: 18000, odometerKm: 29500, acquisitionCost: 3400000, status: 'Available' },
    { registrationNumber: 'CH01YZ8899', name: 'Puma-13',    type: 'Van',     loadCapacityKg: 3200,  odometerKm: 19800, acquisitionCost: 870000,  status: 'Available' },
    { registrationNumber: 'TS07AB1133', name: 'Stallion-14',type: 'Truck',   loadCapacityKg: 11000, odometerKm: 88400, acquisitionCost: 2100000, status: 'Available' },
    { registrationNumber: 'AP09CD4466', name: 'Bison-15',   type: 'Trailer', loadCapacityKg: 22000, odometerKm: 115600, acquisitionCost: 4100000, status: 'Retired' },
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
    { name: 'Vikram Singh',  licenseNumber: 'WB-DL-2018-0992', licenseExpiry: '2025-05-12', phone: '+91 91234 56789', safetyScore: 81, status: 'Available' },
    { name: 'Meera Reddy',   licenseNumber: 'TS-DL-2021-0344', licenseExpiry: '2027-11-19', phone: '+91 99887 77665', safetyScore: 94, status: 'Available' },
    { name: 'Karan Desai',   licenseNumber: 'GJ-DL-2017-0881', licenseExpiry: '2024-09-09', phone: '+91 98765 43210', safetyScore: 68, status: 'Suspended' },
    { name: 'Neha Gupta',    licenseNumber: 'UP-DL-2022-0112', licenseExpiry: '2028-04-25', phone: '+91 91122 33445', safetyScore: 89, status: 'Available' },
    { name: 'Rajesh Khanna', licenseNumber: 'RJ-DL-2019-0773', licenseExpiry: '2026-10-15', phone: '+91 92233 44556', safetyScore: 79, status: 'Available' },
    { name: 'Sanjay Dutt',   licenseNumber: 'MH-DL-2016-0224', licenseExpiry: '2025-01-01', phone: '+91 93344 55667', safetyScore: 86, status: 'Available' },
    { name: 'Pooja Hegde',   licenseNumber: 'KA-DL-2023-0559', licenseExpiry: '2029-07-22', phone: '+91 94455 66778', safetyScore: 99, status: 'Available' },
    { name: 'Anil Kapoor',   licenseNumber: 'DL-DL-2020-0886', licenseExpiry: '2027-02-14', phone: '+91 95566 77889', safetyScore: 91, status: 'Available' },
    { name: 'Manoj Bajpayee',licenseNumber: 'HR-DL-2018-0447', licenseExpiry: '2025-12-11', phone: '+91 96677 88990', safetyScore: 84, status: 'Available' },
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
    {
      source: 'Kolkata', destination: 'Bhubaneswar',
      vehicle: vehicles[6]._id, driver: drivers[6]._id,
      cargoWeightKg: 13500, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 10 * 86400000),
      completedAt:  new Date(Date.now() - 8 * 86400000),
    },
    {
      source: 'Ahmedabad', destination: 'Rajkot',
      vehicle: vehicles[9]._id, driver: drivers[9]._id,
      cargoWeightKg: 2800, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 15 * 86400000),
      completedAt:  new Date(Date.now() - 14 * 86400000),
    },
    {
      source: 'Lucknow', destination: 'Kanpur',
      vehicle: vehicles[7]._id, driver: drivers[10]._id,
      cargoWeightKg: 3800, status: 'Cancelled',
      dispatchedAt: new Date(Date.now() - 12 * 86400000),
    },
    {
      source: 'Surat', destination: 'Vadodara',
      vehicle: vehicles[0]._id, driver: drivers[0]._id,
      cargoWeightKg: 5000, status: 'Completed',
      dispatchedAt: new Date(Date.now() - 20 * 86400000),
      completedAt:  new Date(Date.now() - 19 * 86400000),
    }
  ]);
  console.log(`🛣️  Seeded ${pastTrips.length} past trips`);

  // ── Draft Trips ─────────────────────────────────────
  await Trip.insertMany([
    {
      source: 'Pune', destination: 'Nagpur',
      vehicle: vehicles[4]._id, driver: drivers[11]._id,
      cargoWeightKg: 8500, status: 'Draft'
    },
    {
      source: 'Goa', destination: 'Mumbai',
      vehicle: vehicles[13]._id, driver: drivers[13]._id,
      cargoWeightKg: 10500, status: 'Draft'
    }
  ]);
  console.log('📝 Seeded 2 draft trips');

  // ── Dispatched & On Trip ─────────────────────────────────────
  // Dispatched
  const dispatchedTrip = await Trip.create({
    source: 'Jaipur', destination: 'Udaipur',
    vehicle: vehicles[1]._id, driver: drivers[1]._id,
    cargoWeightKg: 19000, status: 'Dispatched',
    dispatchedAt: new Date(),
    eta: new Date(Date.now() + 4 * 3600000)
  });
  await Vehicle.findByIdAndUpdate(vehicles[1]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[1]._id,   { status: 'On Trip' });

  // On Trip 1
  const runningTrip = await Trip.create({
    source: 'Ahmedabad', destination: 'Surat',
    vehicle: vehicles[12]._id, driver: drivers[12]._id,
    cargoWeightKg: 2900, status: 'On Trip',
    dispatchedAt: new Date(Date.now() - 2 * 3600000),
    eta: new Date(Date.now() + 1.5 * 3600000)
  });
  await Vehicle.findByIdAndUpdate(vehicles[12]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[12]._id,   { status: 'On Trip' });

  // On Trip 2
  const runningTrip2 = await Trip.create({
    source: 'Chennai', destination: 'Coimbatore',
    vehicle: vehicles[5]._id, driver: drivers[4]._id,
    cargoWeightKg: 1800, status: 'On Trip',
    dispatchedAt: new Date(Date.now() - 5 * 3600000),
    eta: new Date(Date.now() - 0.5 * 3600000)
  });
  await Vehicle.findByIdAndUpdate(vehicles[5]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[4]._id,   { status: 'On Trip' });
  
  // On Trip 3
  const runningTrip3 = await Trip.create({
    source: 'Delhi', destination: 'Chandigarh',
    vehicle: vehicles[11]._id, driver: drivers[14]._id,
    cargoWeightKg: 17500, status: 'On Trip',
    dispatchedAt: new Date(Date.now() - 1 * 3600000),
    eta: new Date(Date.now() + 3.5 * 3600000)
  });
  await Vehicle.findByIdAndUpdate(vehicles[11]._id, { status: 'On Trip' });
  await Driver.findByIdAndUpdate(drivers[14]._id,   { status: 'On Trip' });

  console.log('🚀 Seeded 4 active trips (1 Dispatched, 3 On Trip)');

  // ── Expenses ──────────────────────────────────────────────
  const allTrips = [...pastTrips, dispatchedTrip, runningTrip, runningTrip2, runningTrip3];
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
    { trip: allTrips[4]._id, category: 'Fuel',   amount: 19800, notes: 'Heavy transport fuel' },
    { trip: allTrips[4]._id, category: 'Toll',   amount: 1200,  notes: 'Highway tolls' },
    { trip: allTrips[5]._id, category: 'Fuel',   amount: 4300,  notes: 'Van fuel' },
    { trip: allTrips[10]._id, category: 'Fuel',  amount: 3200,  notes: 'Running trip expense' },
    { trip: allTrips[10]._id, category: 'Toll',  amount: 220,   notes: 'Chennai bypass toll' },
    { trip: allTrips[11]._id, category: 'Fuel',  amount: 11000, notes: 'Chandigarh highway' },
    { trip: allTrips[11]._id, category: 'Repair',amount: 2500,  notes: 'Minor part replacement' },
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
