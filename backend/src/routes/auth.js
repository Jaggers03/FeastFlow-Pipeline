const express = require('express');
const router  = express.Router();

// Simulated user store (use bcrypt + JWT + DB in production)
const users = [
  { id: '1', name: 'Demo User', email: 'demo@feastflow.com', password: 'demo123' }
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  res.json({ success: true, data: { user: safe, token: `demo-token-${user.id}` } });
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, error: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ success: false, error: 'Email already registered' });
  const user = { id: String(users.length + 1), name, email, password };
  users.push(user);
  const { password: _, ...safe } = user;
  res.status(201).json({ success: true, data: { user: safe, token: `demo-token-${user.id}` } });
});

module.exports = router;
