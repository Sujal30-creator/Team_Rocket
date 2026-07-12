# FleetForge 🚀 

**FleetForge** is a premium, AI-powered Fleet Management Platform designed to streamline logistics, provide real-time trip tracking, and assist operators with intelligent decision-making. 

## Features ✨

*   **Dark Mode Premium UI:** A stunning Obsidian, Gold, and White theme featuring glassmorphism and modern micro-animations.
*   **Trip Tracking (Amazon-Style):** Watch trips progress through states (Draft ➔ Dispatched ➔ Completed ➔ Cancelled) via an interactive stepper.
*   **Intelligent Dispatching:** Automatically finds and suggests the nearest available vehicles to a trip's source location based on dynamic distance calculation.
*   **FleetForge AI Assistant 🤖:** A fully-integrated, context-aware chatbot powered by OpenAI. It fetches real-time fleet statistics from MongoDB to answer your questions instantly.
*   **Semantic Driver Search 🧠:** Uses OpenAI Vector Embeddings (1536-dimensional) and Node.js Cosine Similarity to allow natural language searches (e.g., *"Find me an available driver with a perfect safety score"*).
*   **Role-Based Access Control:** Secure JWT authentication tailored for Fleet Managers, Dispatchers, Safety Officers, and Financial Analysts.

## Tech Stack 🛠️

**Frontend:**
*   React + Vite
*   Vanilla CSS (Custom Design System with CSS Variables)
*   React Router DOM

**Backend:**
*   Node.js + Express
*   MongoDB + Mongoose
*   OpenAI SDK (`text-embedding-3-small` & `gpt-3.5-turbo`)
*   JWT & Bcrypt

## Installation & Setup 💻

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sujal30-creator/Team_Rocket.git
   cd Team_Rocket
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create a .env file and add:
   # PORT=5001
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret
   # JWT_EXPIRES_IN=7d
   # OPENAI_API_KEY=your_openai_api_key

   # Seed the database (Optional)
   npm run seed

   # Start the backend
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`.

---
*Built with ❤️ by Team Rocket*
