import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';

test.before(async () => {
  await connectDB();
});

test.after(async () => {
  await mongoose.disconnect();
});

test('GET /api/health responds with 200 and healthy status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.database, 'connected');
});

test('GET /api/v1/categories returns list of active categories', async () => {
  const res = await request(app).get('/api/v1/categories');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.categories));
  assert.ok(res.body.categories.length >= 10);
});

test('GET /api/v1/products returns seeded catalogue', async () => {
  const res = await request(app).get('/api/v1/products?limit=10');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.products));
  assert.equal(res.body.products.length, 10);
  assert.ok(res.body.total >= 60);
});

test('POST /api/v1/auth/register rejects SUPER_ADMIN public registration', async () => {
  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Malicious Actor',
    email: 'hacker@example.com',
    password: 'Password123',
    phone: '+919999999999',
    role: 'SUPER_ADMIN',
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('POST /api/v1/auth/login succeeds for demo customer', async () => {
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'customer@vyaparsetu.in',
    password: 'CustomerSecure@2026',
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, 'CUSTOMER');
});

test('POST /api/v1/auth/login succeeds for demo wholesaler and returns seller profile', async () => {
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'wholesaler@vyaparsetu.in',
    password: 'SellerSecure@2026',
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, 'WHOLESALER');
  assert.ok(res.body.sellerProfile);
  assert.equal(res.body.sellerProfile.businessName, 'Bharat Wholesale Bazaar Pvt Ltd');
});

test('Unapproved seller cannot access wholesaler dashboard stats', async () => {
  // Login as pending seller
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'pending.seller@vyaparsetu.in',
    password: 'SellerSecure@2026',
  });
  const token = loginRes.body.token;

  const statsRes = await request(app)
    .get('/api/v1/sellers/dashboard-stats')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statsRes.status, 403);
  assert.equal(statsRes.body.success, false);
});

test('Approved seller CAN access wholesaler dashboard stats', async () => {
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'wholesaler@vyaparsetu.in',
    password: 'SellerSecure@2026',
  });
  const token = loginRes.body.token;

  const statsRes = await request(app)
    .get('/api/v1/sellers/dashboard-stats')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statsRes.status, 200);
  assert.equal(statsRes.body.success, true);
  assert.ok(statsRes.body.stats);
  assert.ok(statsRes.body.stats.activeProducts >= 60);
});

test('Super Admin can retrieve marketplace overview statistics', async () => {
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@vyaparsetu.in',
    password: 'AdminSecure@2026',
  });
  const token = loginRes.body.token;

  const res = await request(app)
    .get('/api/v1/admin/overview')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.stats.totalUsers >= 5);
  assert.ok(res.body.stats.activeProducts >= 60);
});
