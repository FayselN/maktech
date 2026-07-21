const request = require('supertest');
const app = require('../app');

describe('App Routes', () => {
  it('GET /api/health returns status ok', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /privacy-policy returns HTML policy page', async () => {
    const response = await request(app).get('/privacy-policy');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    expect(response.text).toContain('Privacy Policy');
    expect(response.text).toContain('<!DOCTYPE html>');
  });

  it('GET /unknown-route falls through to 404', async () => {
    const response = await request(app).get('/unknown-route-that-does-not-exist');
    
    expect(response.status).toBe(404);
  });
});
