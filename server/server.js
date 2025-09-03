const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware to parse JSON and text data
app.use(express.json());
app.use(express.text());

// In-memory data storage
let dataStore = [];
let nextId = 1;

// Load data from file on startup
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const arr = JSON.parse(raw);
      dataStore = Array.isArray(arr) ? arr : [];
      nextId = dataStore.length > 0 ? Math.max(...dataStore.map(d => d.id)) + 1 : 1;
    } catch (err) {
      console.error('Error loading data:', err);
      dataStore = [];
      nextId = 1;
    }
  }
}

// Save data to file
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataStore, null, 2));
}

loadData();

// Helper function to find data by ID
const findDataById = (id) => {
  return dataStore.find(item => item.id === parseInt(id));
};

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    message: 'Simple JS Backend Server for Data Storage',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'POST /data': 'Store new data (JSON or text)',
      'GET /data': 'Retrieve all stored data',
      'GET /data/:id': 'Retrieve specific data by ID',
      'PUT /data/:id': 'Update existing data',
      'DELETE /data/:id': 'Delete specific data'
    }
  });
});

// POST /data - Store new data
app.post('/data', (req, res) => {
  try {
    const newData = {
      id: nextId++,
      data: req.body,
      type: typeof req.body === 'string' ? 'text' : 'json',
      timestamp: new Date().toISOString()
    };
    
    dataStore.push(newData);
    saveData();
    
    res.status(201).json({
      success: true,
      message: 'Data stored successfully',
      id: newData.id,
      data: newData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error storing data',
      error: error.message
    });
  }
});

// GET /data - Retrieve all stored data
app.get('/data', (req, res) => {
  res.json({
    success: true,
    count: dataStore.length,
    data: dataStore
  });
});

// GET /data/:id - Retrieve specific data by ID
app.get('/data/:id', (req, res) => {
  const data = findDataById(req.params.id);
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Data not found'
    });
  }
  
  res.json({
    success: true,
    data: data
  });
});

// PUT /data/:id - Update existing data
app.put('/data/:id', (req, res) => {
  const data = findDataById(req.params.id);
  
  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Data not found'
    });
  }
  
  try {
    data.data = req.body;
    data.type = typeof req.body === 'string' ? 'text' : 'json';
    data.lastModified = new Date().toISOString();
    saveData();
    
    res.json({
      success: true,
      message: 'Data updated successfully',
      data: data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating data',
      error: error.message
    });
  }
});

// DELETE /data/:id - Delete specific data
app.delete('/data/:id', (req, res) => {
  const dataIndex = dataStore.findIndex(item => item.id === parseInt(req.params.id));
  
  if (dataIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Data not found'
    });
  }
  
  const deletedData = dataStore.splice(dataIndex, 1)[0];
  saveData();
  
  res.json({
    success: true,
    message: 'Data deleted successfully',
    data: deletedData
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API information`);
});

module.exports = app;