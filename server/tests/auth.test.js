import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

let app;

beforeAll(async () => {
  await connectDB();
  app = createApp();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication & User Management APIs', () => {
  const testUser = {
    name: 'Test Customer',
    email: 'test@imovies.com',
    password: 'Password@123',
    phone: '+91 9876543210',
  };

  test('POST /api/v1/auth/register creates a new user account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/v1/auth/register rejects duplicate email registrations', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login validates credentials and issues JWT', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();
    expect(loginRes.body.data.user.name).toBe(testUser.name);
  });

  test('POST /api/v1/auth/login rejects incorrect password', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const failRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword@999',
      });

    expect(failRes.status).toBe(401);
    expect(failRes.body.success).toBe(false);
  });

  test('GET /api/v1/auth/me returns profile for authenticated user', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(testUser.email);
  });

  test('GET /api/v1/auth/me rejects unauthorized request with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
