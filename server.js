import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Default to 3025 to allow Vite to run on 3024 during development
const PORT = process.env.PORT || 3025;
const DATA_FILE = path.join(__dirname, 'storage.json');
const DIST_DIR = path.join(__dirname, 'dist');

app.use(cors());
// Increase limit for larger game history
app.use(express.json({ limit: '50mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
  // Simple logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Helper to read data
async function readData() {
  try {
    if (!existsSync(DATA_FILE)) {
      return {};
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('JSON Parse Error in storage.json:', parseError);
      return {}; // Return empty if corrupted
    }
  } catch (error) {
    console.error('Error reading storage.json:', error);
    return {}; 
  }
}

// Helper to write data
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to storage.json:', err);
    throw err;
  }
}

// --- API Router ---
const apiRouter = express.Router();

apiRouter.get('/store/:key', async (req, res) => {
  try {
    const db = await readData();
    const key = req.params.key;
    const value = db[key];
    // Return object with value property (which might be undefined if key doesn't exist)
    res.json({ value });
  } catch (error) {
    console.error('Error in GET /store:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

apiRouter.post('/store/:key', async (req, res) => {
  try {
    const db = await readData();
    const key = req.params.key;
    const value = req.body.value;
    
    if (value === undefined) {
      console.warn(`Warning: POST /store/${key} received undefined value. Body:`, req.body);
    }

    db[key] = value;
    await writeData(db);
    
    console.log(`Saved key: ${key}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /store:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Catch-all for API 404s (handled inside the router to avoid wildcard syntax issues)
apiRouter.use((req, res) => {
  console.warn(`404 API Request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Mount API routes at /api
app.use('/api', apiRouter);

// --- Frontend serving ---
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  
  // Serve React App for any other route (SPA Catch-all)
  // We use a regex to match everything because newer versions of path-to-regexp 
  // (used by Express) have dropped support for the '*' string wildcard.
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else {
  console.warn('WARNING: "dist" directory not found. Frontend will not be served.');
  console.warn('Run "npm run build" to compile the frontend.');
  
  app.get(/.*/, (req, res) => {
    res.status(404).send('Frontend build not found. Please run "npm run build" on the server.');
  });
}

// Listen on 0.0.0.0 to accept external connections
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});