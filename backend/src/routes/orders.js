const express = require('express');
const router  = express.Router();

// In-memory order store
const orders = [];
let orderCounter = 1000;

const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

// POST /api/orders — Place a new order
router.post('/', (req, res) => {
  const { restaurantId, restaurantName, items, deliveryAddress, paymentMethod } = req.body;

  if (!restaurantId || !items || !items.length) {
    return res.status(400).json({ success: false, error: 'restaurantId and items are required' });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id:              `FF-${++orderCounter}`,
    restaurantId,
    restaurantName,
    items,
    deliveryAddress: deliveryAddress || '123 Default St',
    paymentMethod:   paymentMethod   || 'card',
    status:          'placed',
    total:           parseFloat((total + 2.99).toFixed(2)), // + delivery fee
    subtotal:        parseFloat(total.toFixed(2)),
    deliveryFee:     2.99,
    estimatedTime:   `${25 + Math.floor(Math.random() * 20)} min`,
    placedAt:        new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  };

  orders.push(order);

  // Simulate status progression (for demo)
  let statusIndex = 0;
  const interval = setInterval(() => {
    statusIndex++;
    if (statusIndex < ORDER_STATUSES.length) {
      const o = orders.find(o => o.id === order.id);
      if (o) { o.status = ORDER_STATUSES[statusIndex]; o.updatedAt = new Date().toISOString(); }
    } else {
      clearInterval(interval);
    }
  }, 15000); // advance status every 15 seconds

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders/:id — Track a specific order
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: order });
});

// GET /api/orders — List all orders (admin view)
router.get('/', (_req, res) => {
  res.json({ success: true, count: orders.length, data: orders });
});

module.exports = router;
