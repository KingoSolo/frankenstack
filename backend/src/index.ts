import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import "dotenv/config";
import { AdapterService } from './services/AdapterService';

dotenv.config();

const app = express();
const PORT = 3001;
const adapterService = new AdapterService();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FrankenStack backend is alive! ⚡' 
  });
});

// Create adapter (for testing - we'll use tRPC later)
app.post('/api/adapters', async (req, res) => {
  try {
    const { sourceProtocol, targetProtocol, description, payload, targetEndpoint,config } = req.body;

if (!config?.description) {
  config.description = "Generic adapter"; // fallback description
}
    const adapter = await adapterService.createAdapter({
      userId: 'demo-user',
      sourceProtocol,
      targetProtocol,
      description,
      payload,
      targetEndpoint
    });

    res.json({ success: true, adapter });
  } catch (error) {
    console.error('Error creating adapter:', error);
    res.status(500).json({ success: false, error: 'Failed to create adapter' });
  }
});


// List adapters
app.get('/api/adapters', async (req, res) => {
  try {
    const adapters = await adapterService.listAdapters('demo-user');
    res.json({ success: true, adapters });
  } catch (error) {
    console.error('Error listing adapters:', error);
    res.status(500).json({ success: false, error: 'Failed to list adapters' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🧟 Backend running on http://localhost:${PORT}`);
  console.log(`🗄️  Database connected!`);
});