const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const productRoutes = require('./routes/products');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration using environment variables
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || '*'] // Production frontend URL from env, fallback to allow all
  : [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173']; // Development URLs

// For deployment testing, allow broader CORS temporarily
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL !== '*' 
    ? allowedOrigins 
    : true, // Allow all origins in development or if FRONTEND_URL is '*'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for 3D models and images)
const modelsPath = path.join(__dirname, 'public/models');
app.use('/models', express.static(modelsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.gltf')) {
      res.setHeader('Content-Type', 'model/gltf+json');
    } else if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    }
    // Enable CORS for 3D models
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
  }
}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '3D Visualization API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
});