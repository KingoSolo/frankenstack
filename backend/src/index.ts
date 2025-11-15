import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FrankenStack backend is alive! ⚡' 
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🧟 Backend running on http://localhost:${PORT}`);
});