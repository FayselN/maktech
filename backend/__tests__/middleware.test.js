const deviceMiddleware = require('../middleware/deviceMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const errorMiddleware = require('../middleware/errorMiddleware');

describe('Middleware Unit Tests', () => {
  describe('deviceMiddleware', () => {
    it('returns 400 if x-device-id header is missing', () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      deviceMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Device ID required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('sets req.deviceId and calls next if header is present', () => {
      const req = { headers: { 'x-device-id': 'device-123' } };
      const res = {};
      const next = jest.fn();

      deviceMiddleware(req, res, next);

      expect(req.deviceId).toBe('device-123');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateMiddleware', () => {
    const mockSchema = {
      validate: jest.fn()
    };

    it('returns 400 with validation errors if schema validation fails', () => {
      const req = { body: { invalid: 'data' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      mockSchema.validate.mockReturnValue({
        error: {
          details: [{ message: 'Field is required' }, { message: 'Invalid format' }]
        }
      });

      const middleware = validateMiddleware(mockSchema);
      middleware(req, res, next);

      expect(mockSchema.validate).toHaveBeenCalledWith(req.body, { abortEarly: false, stripUnknown: true });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: ['Field is required', 'Invalid format']
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next if validation succeeds', () => {
      const req = { body: { valid: 'data' } };
      const res = {};
      const next = jest.fn();

      mockSchema.validate.mockReturnValue({ error: null });

      const middleware = validateMiddleware(mockSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('errorMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      
      // Mock console.error to keep test output clean
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('handles ValidationError', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          field1: { message: 'Error 1' },
          field2: { message: 'Error 2' }
        }
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation error',
        errors: ['Error 1', 'Error 2']
      });
    });

    it('handles duplicate key error (11000)', () => {
      const err = {
        code: 11000,
        keyValue: { email: 'test@test.com' }
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate value for email' });
    });

    it('handles CastError', () => {
      const err = {
        name: 'CastError'
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ID format' });
    });

    it('handles generic error with statusCode', () => {
      const err = {
        statusCode: 404,
        message: 'Not Found Custom'
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not Found Custom' });
    });

    it('handles generic error without statusCode (defaults to 500)', () => {
      const err = {
        message: 'Something exploded'
      };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something exploded' });
    });
  });
});
