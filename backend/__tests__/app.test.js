const request = require('supertest');
const app = require('../app');

describe('App Routes', () => {
  it('GET /api/v1/health returns status ok', async () => {
    const response = await request(app).get('/api/v1/health');
    
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

  describe('Version Check and Sunset Middleware', () => {
    it('GET /api/v1/apps/version-check returns 200 with version configuration', async () => {
      const response = await request(app).get('/api/v1/apps/version-check');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('minVersion', 8);
      expect(response.body).toHaveProperty('latestVersion', 8);
      expect(response.body).toHaveProperty('latestVersionName', '1.3.0');
      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('releaseNotes');
    });

    it('GET /api/v1/apps without version header returns 426 Upgrade Required', async () => {
      const response = await request(app).get('/api/v1/apps');

      expect(response.status).toBe(426);
      expect(response.body).toHaveProperty('status', 'upgrade_required');
      expect(response.body.message).toContain('update');
      expect(response.body).toHaveProperty('downloadUrl');
    });

    it('GET /api/v1/apps/trending without version header returns 426 Upgrade Required', async () => {
      const response = await request(app).get('/api/v1/apps/trending');

      expect(response.status).toBe(426);
      expect(response.body).toHaveProperty('status', 'upgrade_required');
      expect(response.body.message).toContain('Please update Mak Tech');
    });

    it('allows requests when SUNSET_ENABLED is false', () => {
      const sunsetMiddleware = require('../middleware/sunsetMiddleware');
      const prev = process.env.SUNSET_ENABLED;
      process.env.SUNSET_ENABLED = 'false';

      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      sunsetMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      process.env.SUNSET_ENABLED = prev;
    });

    it('allows requests with X-App-Build header >= minVersionCode', () => {
      const sunsetMiddleware = require('../middleware/sunsetMiddleware');
      const req = { headers: { 'x-app-build': '8' } };
      const res = {};
      const next = jest.fn();

      sunsetMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
