const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'storage.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for potential image data
app.use(express.static(path.join(__dirname, 'dist'))); // Serve frontend build

// Helper to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // Return empty object if file doesn't exist
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

// Serve React App for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data stored in ${DATA_FILE}`);
});