import request from 'supertest';
import {
    describe,
    it,
    expect,
    beforeEach,
} from 'vitest';

import app from '../../../app.js';

// Testing the response received from the /health endpoint
describe('GET /health', () => {
    let response;

    beforeEach(async () => {
        response = await request(app).get('/health');
    });

    it('should return status 200', () => {
        expect(response.status).toBe(200);
    });

    it('should return json', () => {
        expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return ok true', () => {
        expect(response.body.ok).toBe(true);
    });

    it('should include a time field', () => {
        expect(typeof response.body.time).toBe('string');
    });

    it('should include an uptime field',() => {
        expect(typeof response.body.uptime).toBe('number');
    });

    it('should include an env field', () => {
        expect(typeof response.body.env).toBe('string');
    });
});
