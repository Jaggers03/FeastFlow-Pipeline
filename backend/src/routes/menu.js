const express = require('express');
const router  = express.Router();

const menuItems = {
  '1': [ // Spice Garden
    { id: 'm1', name: 'Butter Chicken', price: 14.99, description: 'Creamy tomato-based curry with tender chicken', category: 'Mains', popular: true, veg: false, image: '🍛' },
    { id: 'm2', name: 'Paneer Tikka', price: 12.99, description: 'Grilled cottage cheese with spiced marinade', category: 'Starters', popular: true, veg: true, image: '🧀' },
    { id: 'm3', name: 'Garlic Naan', price: 3.49, description: 'Soft leavened bread with garlic butter', category: 'Breads', popular: false, veg: true, image: '🫓' },
    { id: 'm4', name: 'Mango Lassi', price: 4.99, description: 'Chilled yoghurt drink with fresh mango', category: 'Drinks', popular: true, veg: true, image: '🥭' },
  ],
  '2': [ // Burger Republic
    { id: 'm5', name: 'Classic Smash Burger', price: 11.99, description: 'Double smash patty, American cheese, pickles', category: 'Burgers', popular: true, veg: false, image: '🍔' },
    { id: 'm6', name: 'Crispy Chicken Burger', price: 10.99, description: 'Fried chicken fillet, coleslaw, sriracha mayo', category: 'Burgers', popular: true, veg: false, image: '🍗' },
    { id: 'm7', name: 'Loaded Fries', price: 6.99, description: 'Thick-cut fries with cheese sauce and jalapeños', category: 'Sides', popular: true, veg: true, image: '🍟' },
    { id: 'm8', name: 'Milkshake', price: 5.99, description: 'Thick hand-blended shake — vanilla, choc, or strawberry', category: 'Drinks', popular: false, veg: true, image: '🥤' },
  ],
  '3': [ // Sakura Sushi
    { id: 'm9',  name: 'Salmon Nigiri (x6)', price: 16.99, description: 'Fresh Atlantic salmon over seasoned sushi rice', category: 'Nigiri', popular: true, veg: false, image: '🍣' },
    { id: 'm10', name: 'Dragon Roll', price: 18.99, description: 'Prawn tempura inside, avocado on top', category: 'Rolls', popular: true, veg: false, image: '🌀' },
    { id: 'm11', name: 'Edamame', price: 4.99, description: 'Steamed young soybeans with sea salt', category: 'Starters', popular: false, veg: true, image: '🫛' },
    { id: 'm12', name: 'Miso Soup', price: 3.49, description: 'Traditional dashi broth with tofu and wakame', category: 'Soups', popular: false, veg: true, image: '🍵' },
  ],
  '5': [ // Taco Fiesta
    { id: 'm13', name: 'Carne Asada Tacos (x3)', price: 9.99, description: 'Grilled steak, pico de gallo, guacamole', category: 'Tacos', popular: true, veg: false, image: '🌮' },
    { id: 'm14', name: 'Veggie Burrito', price: 8.99, description: 'Black beans, rice, cheese, sour cream', category: 'Burritos', popular: false, veg: true, image: '🌯' },
    { id: 'm15', name: 'Nachos Grande', price: 7.99, description: 'Tortilla chips, melted cheese, jalapeños, salsa', category: 'Sides', popular: true, veg: true, image: '🫔' },
  ],
};

// GET /api/menu/:restaurantId
router.get('/:restaurantId', (req, res) => {
  const items = menuItems[req.params.restaurantId];
  if (!items) return res.status(404).json({ success: false, error: 'Menu not found' });

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ success: true, restaurantId: req.params.restaurantId, categories: grouped, items });
});

module.exports = router;
