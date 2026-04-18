# 🍏 YumZy — Food Allergy Scanner

A full-stack web app helping people with food allergies scan product barcodes, detect allergens, and get safe recipes powered by AI.

## Features
- 🔐 Simple login & registration
- 📋 Allergy quiz (5 steps) 
- 📱 Barcode scanner (camera or manual)
- 🤖 AI allergen analysis (OpenAI)
- 👨‍🍳 AI Recipe generator
- 🌍 Multi-language (EN, RU, UZ)

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI:** OpenAI API (gpt-4o-mini)
- **Product Data:** Open Food Facts API

## Getting Started

### 1. Set up MongoDB Atlas
Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas) and get your connection string.

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your MONGO_URI, JWT_SECRET, OPENAI_API_KEY
```

### 3. Install & Run
```bash
# Backend
cd server
npm install
node server.js

# Frontend (new terminal)
cd client
npm install
npm run dev
```

### 4. Open in browser
Visit `http://localhost:3000`

## License
MIT
