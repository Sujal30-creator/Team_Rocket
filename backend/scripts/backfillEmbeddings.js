require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Driver = require('../models/Driver');

const openai = new OpenAI();

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const drivers = await Driver.find({ embedding: { $exists: false } });
    console.log(`Found ${drivers.length} drivers needing embeddings.`);

    for (const driver of drivers) {
      console.log(`Generating embedding for driver: ${driver.name}`);
      const text = `Driver Name: ${driver.name}, License: ${driver.licenseNumber}, Status: ${driver.status}, Safety Score: ${driver.safetyScore}/100`;
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      driver.embedding = response.data[0].embedding;
      await driver.save();
    }

    console.log("Backfill complete!");
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  }
}

backfill();
