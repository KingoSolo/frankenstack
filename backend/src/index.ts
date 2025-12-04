import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { AdapterService } from './services/AdapterService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const adapterService = new AdapterService();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    message: "FrankenStack backend is alive! ⚡"
  });
});

// Create adapter
app.post('/api/adapters', async (req, res) => {
  try {
    const { sourceProtocol, targetProtocol, description, payload, targetEndpoint } = req.body;

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
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to create adapter" });
  }
});

// List adapters
app.get('/api/adapters', async (req, res) => {
  try {
    const adapters = await adapterService.listAdapters('demo-user');
    res.json({ success: true, adapters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to list adapters" });
  }
});

// Start server 🎉
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
