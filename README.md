# 3D Product Visualization Platform

A full-stack web application that provides interactive 3D product visualization with React Three Fiber, Express.js, and MongoDB. This platform allows users to browse products in a 3D environment with detailed product information and interactive controls.

## 🚀 Project Overview

This application consists of a **React frontend** with 3D visualization capabilities and an **Express.js backend** with MongoDB database integration. Users can:

- Browse products in an interactive 3D gallery
- View detailed product information with 3D model visualization
- Control 3D models with animations, rotation, and zoom
- Filter products by categories
- Experience responsive 3D graphics powered by Three.js

## 🏗️ Architecture

```
visualization/
├── frontend/          # React application with Three.js
├── backend/           # Express.js API server
└── README.md         # This file
```

### Frontend (React + Three.js)
- **Framework**: React 19.1.1 with Create React App
- **3D Engine**: Three.js with React Three Fiber
- **3D Utilities**: React Three Drei for enhanced 3D components
- **Routing**: React Router DOM for SPA navigation
- **HTTP Client**: Axios for API communication
- **Testing**: Jest with React Testing Library

### Backend (Express.js + MongoDB)
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **File Serving**: Static file serving for 3D models (.glb/.gltf)
- **CORS**: Cross-origin resource sharing for frontend integration
- **Environment**: dotenv for configuration management

## 📁 Project Structure

### Backend Structure
```
backend/
├── config/
│   └── database.js         # MongoDB connection configuration
├── models/
│   └── Product.js          # Product data model with 3D model support
├── routes/
│   └── products.js         # RESTful API routes for products
├── scripts/
│   └── seedData.js         # Database seeding script
├── public/
│   ├── models/             # 3D model files (.glb/.gltf)
│   └── images/             # Product images
├── server.js               # Main server application
└── package.json           # Backend dependencies
```

### Frontend Structure
```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable 3D and UI components
│   │   ├── AnimatedModel.js      # 3D model with animation support
│   │   ├── AnimationControls.js  # Animation control interface
│   │   ├── DebugInfo.js          # Development debugging tools
│   │   ├── ProductViewer.js      # Main 3D product viewer
│   │   └── ViewerControls.js     # 3D viewer control interface
│   ├── pages/              # Application pages
│   │   ├── ProductGallery.js     # Product listing with 3D previews
│   │   └── ProductDetail.js      # Detailed product view
│   ├── services/           # API and business logic
│   │   ├── api.js                # Base API configuration
│   │   └── productService.js     # Product-specific API calls
│   ├── utils/              # Utility functions
│   │   ├── helpers.js            # General helper functions
│   │   └── modelValidation.js    # 3D model validation utilities
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
└── package.json            # Frontend dependencies
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 19.1.1** - Modern React with latest features
- **Three.js 0.180.0** - 3D graphics library
- **React Three Fiber 9.3.0** - React renderer for Three.js
- **React Three Drei 10.7.6** - Useful helpers for React Three Fiber
- **React Router DOM 7.9.1** - Client-side routing
- **Axios 1.12.2** - HTTP client for API requests

### Backend Technologies
- **Express.js 5.1.0** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 8.18.1** - MongoDB object modeling
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 17.2.2** - Environment variable management

## 🗄️ Database Schema

### Product Model
```javascript
{
  name: String,              // Product name
  description: String,       // Product description
  price: Number,            // Product price
  category: String,         // Product category (enum)
  images: [String],         // Array of image URLs
  model3d: String,          // Path to 3D model file (.glb/.gltf)
  animations: {             // 3D model animations
    available: [String],    // Available animation names
    defaultAnimation: String, // Default animation to play
    autoPlay: Boolean       // Auto-play animations
  },
  specifications: {         // Product specifications
    dimensions: String,
    weight: String,
    material: String,
    color: String
  },
  inStock: Boolean,         // Inventory status
  createdAt: Date          // Creation timestamp
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visualization
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/visualization
   PORT=5000
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev          # Development with nodemon
   # or
   npm start           # Production mode
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm start
   ```
   Application runs on `http://localhost:3000`

3. **Seed Database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

## 🔧 API Endpoints

### Products API
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/health` - API health check

### Static File Serving
- `/models/*` - Serve 3D model files (.glb/.gltf)
- `/images/*` - Serve product images

## 🎮 Features

### 3D Visualization Features
- **Interactive 3D Models**: Rotate, zoom, and pan 3D product models
- **Animation Support**: Play and control 3D model animations
- **Multiple Camera Angles**: Switch between different viewing perspectives
- **Real-time Rendering**: Smooth 3D graphics with Three.js
- **Model Loading**: Support for .glb and .gltf 3D model formats

### Application Features
- **Product Gallery**: Grid view of products with 3D previews
- **Product Details**: Detailed view with specifications and full 3D interaction
- **Category Filtering**: Browse products by category
- **Responsive Design**: Works on desktop and mobile devices
- **API Integration**: Real-time data from MongoDB backend

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                # Run tests
npm run test:coverage   # Run with coverage
```

### Backend Testing
```bash
cd backend
npm test               # Run backend tests (when implemented)
```

## 📦 Build and Deployment

### Frontend Production Build
```bash
cd frontend
npm run build
```

### Environment Configuration
- **Development**: Uses `http://localhost:3000` and `http://localhost:5000`
- **Production**: Configure CORS origins in backend server.js

## 🔍 Development Tools

### Available Scripts

#### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

#### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues

1. **3D Models Not Loading**
   - Ensure 3D model files are in `backend/public/models/`
   - Check file paths in database match actual files
   - Verify CORS headers for model files

2. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify MONGODB_URI in `.env` file
   - Ensure database permissions are correct

3. **Frontend Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check React and Three.js version compatibility
   - Verify all imports are correct

## 📚 Additional Resources

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

*Last updated: $(Get-Date -Format "yyyy-MM-dd")*