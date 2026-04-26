const express = require('express');
const router  = express.Router();

// In-memory data (replace with MongoDB/PostgreSQL in production)
const restaurants = [
  {
    id: '1',
    name: 'Spice Garden',
    cuisine: 'Indian',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minOrder: 15,
    image: '🍛',
    tags: ['Spicy', 'Vegetarian Friendly', 'Popular'],
    address: '12 Curry Lane, Food District',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Burger Republic',
    cuisine: 'American',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 10,
    image: '🍔',
    tags: ['Burgers', 'Fast Food', 'Best Seller'],
    address: '45 Grill Street, Downtown',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    rating: 4.9,
    deliveryTime: '30-45 min',
    deliveryFee: 3.99,
    minOrder: 20,
    image: '🍣',
    tags: ['Sushi', 'Fresh', 'Premium'],
    address: '88 Cherry Blossom Ave',
    isOpen: true,
  },
  {
    id: '4',
    name: 'Pasta Palazzo',
    cuisine: 'Italian',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 2.49,
    minOrder: 12,
    image: '🍝',
    tags: ['Pasta', 'Pizza', 'Family Friendly'],
    address: '7 Via Roma, West End',
    isOpen: false,
  },
  {
    id: '5',
    name: 'Taco Fiesta',
    cuisine: 'Mexican',
    rating: 4.4,
    deliveryTime: '15-25 min',
    deliveryFee: 0.99,
    minOrder: 8,
    image: '🌮',
    tags: ['Tacos', 'Quick', 'Budget Friendly'],
    address: '33 Salsa Road, East Side',
    isOpen: true,
  },
  {
    id: '6',
    name: 'Dragon Palace',
    cuisine: 'Chinese',
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 1.49,
    minOrder: 15,
    image: '🥟',
    tags: ['Dim Sum', 'Noodles', 'Authentic'],
    address: '101 Jade Street, Chinatown',
    isOpen: true,
  },
];

// GET /api/restaurants
router.get('/', (req, res) => {
  const { cuisine, search, open } = req.query;
  let result = [...restaurants];

  if (cuisine)  result = result.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  if (search)   result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  if (open)     result = result.filter(r => r.isOpen === true);

  res.json({ success: true, count: result.length, data: result });
});

// GET /api/restaurants/:id
router.get('/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
});

module.exports = router;
