const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Furniture', 'Fashion', 'Home & Garden', 'Sports', 'Other']
  },
  images: {
    type: [String],
    required: true,
    default: []
  },
  model3d: {
    type: String,
    required: true // Path to .glb/.gltf file
  },
  animations: {
    available: {
      type: [String],
      default: []
    },
    defaultAnimation: {
      type: String,
      default: null
    },
    autoPlay: {
      type: Boolean,
      default: false
    }
  },
  specifications: {
    dimensions: {
      type: String
    },
    weight: {
      type: String
    },
    material: {
      type: String
    },
    color: {
      type: String
    }
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);