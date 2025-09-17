const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  // -------------------------
  // FURNITURE CATEGORY (Unchanged)
  // -------------------------
  {
    name: "Modern Office Chair",
    description: "Ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours with premium comfort.",
    price: 299.99,
    category: "Furniture",
    images: ["https://media.sketchfab.com/models/675f34f7304e4d92812a41e9750539aa/thumbnails/85ce30a9273c425ab2972e79c1558039/313b06d66ee24b5294c737bb017222eb.jpeg"],
    model3d: "/models/office_chair_modern.glb",
    animations: {
      available: ["idle", "rotate", "height_adjust"],
      defaultAnimation: "rotate",
      autoPlay: true
    },
    specifications: {
      dimensions: "65cm x 65cm x 110-120cm",
      weight: "18kg",
      material: "Mesh fabric, Aluminum base",
      color: "Black"
    },
    inStock: true
  },
  {
    name: "Wooden Table",
    description: "Solid oak dining table with natural finish. Perfect for family gatherings and everyday dining.",
    price: 899.99,
    category: "Furniture",
    images: ["https://media.sketchfab.com/models/cf41551a07d5492bae1bff6b81cb2e00/thumbnails/e83c29202790472bad7f4a0cbb3f77c0/a8f296eaf175444ea84f9ae24cb551e9.jpeg"],
    model3d: "/models/old_wooden_table.glb",
    animations: {
      available: ["idle", "expand"],
      defaultAnimation: "idle",
      autoPlay: false
    },
    specifications: {
      dimensions: "180cm x 90cm x 75cm",
      weight: "45kg",
      material: "Solid Oak Wood",
      color: "Natural Oak"
    },
    inStock: true
  },

  // -------------------------
  // ELECTRONICS CATEGORY (Better Products)
  // -------------------------
 {
  name: "Gaming Laptop Pro",
  description: "Sleek high-performance laptop with Intel i9 13th Gen processor, RTX 4070 graphics, 16GB RAM, and 1TB SSD. Ideal for professionals and gamers.",
  price: 2199.99,
  category: "Electronics",
  images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxcXrGtBGlWfSUK_01e7ePZaT-FkkYf_JBSA&s"],
  model3d: "/models/laptop.glb",
  animations: {
    available: ["idle", "open", "close", "keyboard_light"],
    defaultAnimation: "open",
    autoPlay: true
  },
  specifications: {
    dimensions: "35.7cm x 24.5cm x 1.7cm",
    weight: "1.9kg",
    material: "Aluminum chassis",
    color: "Space Gray"
  },
  inStock: true
},
  {
    name: "4K Smart OLED TV",
    description: "65-inch ultra-slim 4K OLED TV with HDR10+, Dolby Vision, and built-in voice assistant for seamless entertainment.",
    price: 2299.99,
    category: "Electronics",
   images: ["https://5.imimg.com/data5/SELLER/Default/2021/9/RR/BH/SG/123224342/a8h-oled-4k-ultra-hdrsmart-tv.PNG"],
    model3d:"/models/smart_tv.glb",
    animations: {
      available: ["idle", "power_on", "screen_demo"],
      defaultAnimation: "screen_demo",
      autoPlay: false
    },
    specifications: {
      dimensions: "145cm x 84cm x 3.5cm",
      weight: "24kg",
      material: "Aluminum frame, OLED panel",
      color: "Titanium Black"
    },
    inStock: true
  },

  // -------------------------
  // FASHION CATEGORY (Better Products)
  // -------------------------
  {
    name: "Premium Running Shoes",
    description: "Lightweight breathable running shoes with memory foam insole and high-traction sole for daily training.",
    price: 129.99,
    category: "Fashion",
    images: ["https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTdbKFq8rZSAGsMWgVwmQyeSKRaomykC659ygLfV4RNBeJ-uWBy9OSGPixJ0MmcjmmiTXy4Ml1m3ngVg5oBRYG-slMn-VyjbXD3omS9MNu4v1j67rNzYKUVq9U"],
    model3d: "/models/running_shoes.glb",
    animations: {
      available: ["idle", "lace_tie", "walk_cycle"],
      defaultAnimation: "idle",
      autoPlay: false
    },
    specifications: {
      dimensions: "US Size 10",
      weight: "350g per shoe",
      material: "Engineered mesh, EVA sole",
      color: "Gray/Neon Green"
    },
    inStock: true
  },
  {
    name: "Classic Wool Overcoat",
    description: "Tailored wool overcoat with minimalist design. Warm, stylish, and versatile for winter and formal wear.",
    price: 399.99,
    category: "Fashion",
    images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRXTUK_RlM0oFmJqhr7fh5qIU55oRoXu_WnAzqt6LG2GKKG4s7Il_x66BYEkTSNNRPHzs&usqp=CAU"],
    model3d: "/models/female_overcoat.glb",
    animations: {
      available: ["idle", "flutter", "walk"],
      defaultAnimation: "flutter",
      autoPlay: true
    },
    specifications: {
      dimensions: "Size M (Chest: 102cm)",
      weight: "1.5kg",
      material: "100% Wool, Satin lining",
      color: "Charcoal Gray"
    },
    inStock: true
  },

  // -------------------------
  // HOME & GARDEN CATEGORY (Better Product)
  // -------------------------
 

  // -------------------------
  // SPORTS CATEGORY (Better Product)
  // -------------------------
  {
    name: "Carbon Fiber Tennis Racket",
    description: "Professional-grade lightweight tennis racket with vibration dampening technology for powerful, accurate shots.",
    price: 249.99,
    category: "Sports",
    images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnhSAscqbbWwaRXx6JKnEBdHdA1yjZBOVUmv2hUfJ-qfGag_b5zcDIYIe6fFLoB7TEvTw&usqp=CAU"],
    
    model3d: "/models/tennis_racket.glb",
    animations: {
      available: ["idle", "swing", "bounce"],
      defaultAnimation: "bounce",
      autoPlay: true
    },
    specifications: {
      dimensions: "68.5cm x 27cm",
      weight: "305g (unstrung)",
      material: "Carbon Fiber, Polyurethane grip",
      color: "Black/Red"
    },
    inStock: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted successfully');

    // Close connection
    await mongoose.connection.close();
    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
