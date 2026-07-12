const Driver = require('../models/Driver');
const OpenAI = require('openai');

// Initialize OpenAI (will use OPENAI_API_KEY from env)
let openai;
try { openai = new OpenAI(); } catch (err) {}

async function generateEmbedding(driver) {
  if (!openai) return null;
  const text = `Driver Name: ${driver.name}, License: ${driver.licenseNumber}, Status: ${driver.status}, Safety Score: ${driver.safetyScore}/100`;
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error("Embedding error:", err.message);
    return null;
  }
}

// Cosine similarity mathematical calculation
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

exports.list = async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const drivers = await Driver.find(filter).sort('-createdAt');
  res.json(drivers);
};

exports.create = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    const embedding = await generateEmbedding(driver);
    if (embedding) driver.embedding = embedding;
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    let driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found.' });
    
    Object.assign(driver, req.body);
    const embedding = await generateEmbedding(driver);
    if (embedding) driver.embedding = embedding;
    
    await driver.save();
    res.json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);
  if (!driver) return res.status(404).json({ message: 'Driver not found.' });
  res.json({ message: 'Driver removed.' });
};

// Semantic Search
exports.search = async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: "Search query required" });
  if (!openai) return res.status(500).json({ message: "OpenAI API Key not configured" });

  try {
    // 1. Embed the user's query
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    const queryVector = response.data[0].embedding;

    // 2. Fetch all drivers with their embeddings
    const allDrivers = await Driver.find({}).select('+embedding');

    // 3. Calculate similarity score for each driver
    const scoredDrivers = allDrivers
      .filter(d => d.embedding && d.embedding.length > 0)
      .map(d => {
        const score = cosineSimilarity(queryVector, d.embedding);
        const driverObj = d.toObject();
        delete driverObj.embedding; // Remove large array before sending to frontend
        return { ...driverObj, score };
      })
      .sort((a, b) => b.score - a.score) // Sort highest score first
      .slice(0, 5); // Return top 5 matches

    res.json(scoredDrivers);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: err.message });
  }
};
