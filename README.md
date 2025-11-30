⚡ Frankenstack – AI-Powered Adapter Generator

Frankenstack is a modular, AI-driven adapter builder that lets you instantly generate fully-functional protocol-to-protocol adapters without writing boilerplate.
It’s basically your integration Swiss-army knife — fast, smart, and customizable.

✨ What Frankenstack Does

🧬 Generates adapters using AI

🔄 Supports REST → GraphQL (more protocols coming)

🗂 Saves your generated adapters for later use

🎛 Clean UI built for speed and iteration

⚡ Real-time generation feedback (progress bar + toasts)

🎥 Demo

Here’s Frankenstack in action — generating a full adapter from scratch, saving it, and rendering it in the flow canvas:

🧱 Tech Stack
Frontend


Next.js


React


TailwindCSS


ShadCN


Framer Motion


Sonner (toast notifications)


Backend


TypeScript


Express


Drizzle ORM


SQLite


OpenAI API (AI code generation)



📁 Project Structure
frankenstack/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
└── backend/
    ├── src/
    │   ├── adapters/
    │   ├── routes/
    │   ├── services/
    │   └── db/
    └── drizzle/


🚀 How It Works


You choose a source protocol and a target protocol


Enter a short description of what you want


Hit Generate Adapter


Frankenstack uses OpenAI + your template logic to build complete adapter code


The generated adapter is saved + added to your “Recently Generated” list


You can visualize everything in the Flow canvas



🛠 Running Locally
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

Frontend runs on http://localhost:3000
Backend runs on http://localhost:5050

🌱 Environment Variables
Create a .env file in /backend:
OPENAI_API_KEY=your_key_here
DATABASE_URL=sqlite.db


🧩 Features Roadmap


🔌 More protocol adapters (SOAP, gRPC, Webhooks, etc.)


🌐 Multi-adapter workflows


📦 Plugin marketplace


🧠 Fine-tuned model for adapter generation


🎛 Custom template editor



🤝 Contributing
PRs are welcome — the stack is designed to be extendable.
If you want to add a new protocol adapter, all you need is:


A spec file
A template
One service function



📜 License
MIT 
