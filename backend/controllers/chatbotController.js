const OpenAI = require('openai');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// We initialize openai without a hardcoded key, it will use process.env.OPENAI_API_KEY
let openai;
try {
  openai = new OpenAI();
} catch (err) {
  console.log("OpenAI not initialized: Missing OPENAI_API_KEY");
}

exports.chat = async (req, res) => {
  if (!openai) {
    // Attempt to re-initialize in case key was added after server start
    try {
      openai = new OpenAI();
    } catch (err) {
      return res.status(500).json({ message: "OpenAI API Key is missing. Please add it to backend/.env" });
    }
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    // Gather live fleet context
    const vehicleCount = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const inShopVehicles = await Vehicle.countDocuments({ status: 'In Shop' });
    const onTripVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
    
    const activeTrips = await Trip.countDocuments({ status: { $in: ['Dispatched', 'On Trip'] } });

    const systemPrompt = `You are FleetForge AI, an expert fleet management assistant.
You help managers run their logistics, fleets, and drivers efficiently.
Current Live System State:
- Total Vehicles: ${vehicleCount}
- Available: ${availableVehicles}
- In Shop: ${inShopVehicles}
- On Trip: ${onTripVehicles}
- Active Trips Running: ${activeTrips}

Answer the user's questions concisely and professionally. If they ask about the fleet, use the live data provided above.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 150,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: "Error communicating with OpenAI. Check your API Key." });
  }
};
