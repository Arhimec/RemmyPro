import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'storage.json');
const DIST_DIR = path.join(__dirname, 'dist');

app.use(cors());
// Express 4.16+ has built-in body parsing
app.use(express.json({ limit: '50mb' })); 

// Helper to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return {}; 
    }
    throw error;
  }
}

// Helper to write data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes
app.get('/api/store/:key', async (req, res) => {
  try {
    const db = await readData();
    const key = req.params.key;
    const value = db[key];
    res.json({ value });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/store/:key', async (req, res) => {
  try {
    const db = await readData();
    const key = req.params.key;
    const value = req.body.value;
    
    db[key] = value;
    await writeData(db);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Check if dist exists to serve frontend
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  
  // Serve React App for any other route
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  console.warn('WARNING: "dist" directory not found. Frontend will not be served.');
  console.warn('Run "npm run build" to compile the frontend.');
  
  app.get('*', (req, res) => {
    res.status(404).send('Frontend build not found. Please run "npm run build" on the server.');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data stored in ${DATA_FILE}`);
});