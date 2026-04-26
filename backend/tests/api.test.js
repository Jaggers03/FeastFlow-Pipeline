const request = require('supertest');
const app     = require('../src/server');

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('feastflow-backend');
  });
});

describe('GET /api/restaurants', () => {
  it('returns a list of restaurants', async () => {
    const res = await request(app).get('/api/restaurants');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('filters by cuisine', async () => {
    const res = await request(app).get('/api/restaurants?cuisine=Indian');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(r => r.cuisine === 'Indian')).toBe(true);
  });

  it('filters open restaurants', async () => {
    const res = await request(app).get('/api/restaurants?open=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every(r => r.isOpen === true)).toBe(true);
  });
});

describe('GET /api/restaurants/:id', () => {
  it('returns a single restaurant', async () => {
    const res = await request(app).get('/api/restaurants/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe('1');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/restaurants/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/menu/:restaurantId', () => {
  it('returns menu items for a restaurant', async () => {
    const res = await request(app).get('/api/menu/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });
});

describe('POST /api/orders', () => {
  it('creates a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        restaurantId:   '1',
        restaurantName: 'Spice Garden',
        items: [{ id: 'm1', name: 'Butter Chicken', price: 14.99, quantity: 2 }],
        deliveryAddress: '42 Test Avenue',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^FF-/);
    expect(res.body.data.status).toBe('placed');
  });

  it('rejects order with missing fields', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.statusCode).toBe(400);
  });
});
