# ⚡ Frankenstack – AI-Powered Adapter Generator

Frankenstack is an AI-driven system that generates fully functional protocol adapters on the fly. Choose your source protocol, target protocol, describe your adapter… and Frankenstack builds the whole thing automatically. No boilerplate. No stress.

---

## ✨ Features

- 🧬 **AI Adapter Generation** – Automatically builds adapters using OpenAI  
- 🔄 **REST → GraphQL Support** (more protocols coming soon)  
- 🎛 **Clean, Fast UI** built with Next.js + Tailwind  
- ⚡ **Progress Bar + Toast Notifications** with Framer Motion + Sonner  
- 📁 **Recently Generated List** for quick access  
- 🗺 **Flow Canvas Visualization** to see adapter structure  
- 🗂 **Backend Persistence** via Drizzle + SQLite  

---

## 🧱 Tech Stack

### Frontend
- Next.js  
- React  
- TailwindCSS  
- ShadCN  
- Framer Motion  
- Sonner  

### Backend
- Node.js / Express  
- TypeScript  
- Drizzle ORM + SQLite  
- OpenAI API  

---

## 📁 Project Structure

frankenstack/
│
├── frontend/
│ ├── app/
│ ├── components/
│ ├── lib/
│ └── public/
│
└── backend/
├── src/
│ ├── adapters/
│ ├── routes/
│ ├── services/
│ └── db/
└── drizzle/

---

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```
### Frontend
```
cd frontend
npm install
npm run dev
```

🌱 Environment Variables

Create a .env file inside /backend:

OPENAI_API_KEY=your_key_here
DATABASE_URL=sqlite.db

🧠 How It Works

Select source + target protocol

Provide a short description of the adapter

Hit Generate Adapter

AI produces the adapter code

Adapter is saved + shown in your "Recently Generated" list

Flow Canvas visualizes the adapter pipeline

🗺 Roadmap

More protocol adapters (SOAP, gRPC, Webhooks)

Multi-step workflows

Template editor

Adapter marketplace

Fine-tuned AI model

🤝 Contributing

PRs welcome! The system is built to be easily extendable.
New protocol? Just add:

a spec file

a template file

a generator service

📜 License

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Kiroween 2025](https://img.shields.io/badge/Hackathon-Kiroween%202025-purple)](https://kiroween.devpost.com)



