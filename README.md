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

## 🎯 Kiro Integration

FrankenStack uses **ALL 4 major Kiro features:**

### ✅ Specs (400+ lines)
- 5 protocol adapter specifications
- Detailed code patterns and generation rules
- See: `.kiro/specs/`

### ✅ Vibe Coding
- Real-time AI code generation via API
- Custom adapters based on natural language
- See: `backend/src/services/KiroService.ts`

### ✅ Agent Hooks
- Automated adapter boilerplate generation
- See: `.kiro/hooks/new-adapter.yaml`

### ✅ Steering Documents (500+ lines)
- Coding standards and best practices
- Error handling patterns
- See: `.kiro/steering/adapter-patterns.md`

### 🔄 MCP Server (Specification)
- Protocol analyzer specification
- See: `.kiro/mcp/protocol-analyzer/`

**Full Kiro documentation:** [HOW_WE_USED_KIRO.md](./HOW_WE_USED_KIRO.md)

---

## 📁 Project Structure
```
frankenstack/
├── .kiro/                    # Kiro integration (REQUIRED for hackathon)
│   ├── specs/               # Protocol adapter specs
│   ├── hooks/               # Automation hooks
│   ├── steering/            # Coding standards
│   └── mcp/                 # MCP server spec
├── frontend/                # Next.js app
│   ├── app/                 # Pages
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── backend/                 # Express + tRPC
│   ├── src/
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database
│   │   └── templates/       # Base adapter templates
│   └── drizzle/             # Database migrations
├── HOW_WE_USED_KIRO.md     # Kiro integration proof
├── BEFORE_AFTER.md          # Impact metrics
└── LICENSE                  # MIT License
```

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (React framework)
- React Flow (visualization)
- Tailwind CSS (styling)
- Zustand (state management)
- Framer Motion (animations)

**Backend:**
- Node.js + Express
- tRPC (type-safe APIs)
- Drizzle ORM (database)
- PostgreSQL (Supabase)

**AI Integration:**
- Kiro specs and vibe coding
- Custom code generation engine

---

## 📊 Impact Metrics

| Metric | Manual | With Kiro | Improvement |
|--------|--------|-----------|-------------|
| Time per adapter | 4 hours | 10 seconds | 97% faster |
| Bugs found | 9 | 0 | 100% fewer |
| Code consistency | 60% | 100% | 40% better |
| Lines generated | 0 | 400+ | ∞ |

**See full comparison:** [BEFORE_AFTER.md](./BEFORE_AFTER.md)

---

## 🧪 Testing
```bash
# Backend tests
cd backend
npm test

# Run specific adapter test
npm test rest-to-graphql

# Check all protocol combinations
npm run test:protocols
```

---

## 🎃 Hackathon Category: Frankenstein

**Why this fits:**
- **Stitches** incompatible protocols together (like Frankenstein's body parts)
- **Brings dead integrations to life** (resurrects abandoned API connections)
- **Electric theme** (lightning bolts in UI, powered by AI)
- **Laboratory aesthetic** (spooky green Frankenstein lab colors)

---

## 📝 Environment Variables

**Backend `.env`:**
```bash
DATABASE_URL=postgresql://...
NODE_ENV=development
HUGGINGFACE_API_KEY=hf_... # Optional for AI generation
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🐛 Known Issues

- WebSocket adapters require `ws` package installation
- gRPC adapters use simplified REST-like interface (full gRPC in production)
- SOAP XML parsing is basic (use `xml2js` in production)

---

## 🤝 Contributing

This is a hackathon project, but contributions welcome!

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

MIT License - 

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Kiroween 2025](https://img.shields.io/badge/Hackathon-Kiroween%202025-purple)](https://kiroween.devpost.com)

---

## 👤 Author

**[Solomon Adeniran]**
- GitHub: [@KingoSolo](https://github.com/KingoSolo)
- Devpost: [Your Devpost Profile](https://devpost.com/yourusername)

---

## 🙏 Acknowledgments

- Built with [Kiro IDE](https://kiro.dev)
- Hackathon: [Kiroween 2025](https://kiroween.devpost.com)
- Inspired by the pain of API integration hell

---

## 📺 Screenshots

![Landing Page](./frontend/public/screenshots/landing.png)
![Protocol Selection](./frontend/public/screenshots/protocols.png)
![Generated Code](./frontend/public/screenshots/code-viewer.png)
![React Flow Visualization](./frontend/public/screenshots/react-flow.png)

---





