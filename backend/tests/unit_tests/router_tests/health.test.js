import request from 'supertest';
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
} from 'vitest';

// Before importing app, create a mock pool to avoid altering the real DB
vi.mock('../../../config/dbConn.js', () => ({
    default: {
        query: vi.fn(),
    },
}));

import app from '../../../app.js';
import pool from '../../../config/dbConn.js';

// Testing the response received from the /health endpoint
describe('GET /health', () => {

    beforeEach(async () => {
        // Before each test, clear pool mocks
        vi.clearAllMocks();
    });

    it('should return status 200, ok, db up, valid time, valid uptime, and valid env when query is successful', async () => {
        pool.query.mockResolvedValueOnce({});

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.db).toBe('up');
        expect(typeof response.body.time).toBe('string');
        expect(typeof response.body.uptime).toBe('number');
        expect(typeof response.body.env).toBe('string');
    });

    it('should return status 500, ok, db down, and error when query fails', async () => {
        pool.query.mockRejectedValueOnce(new Error ('DB down'));

        const response = await request(app).get('/health');

        expect(response.status).toBe(500);
        expect(response.body.ok).toBe(false);
        expect(response.body.db).toBe('down');
        expect(response.body.error).toBe('DB down');
    });

    it('should call SELECT 1 to ping the database', async () => {
        pool.query.mockResolvedValueOnce({});

        await request(app).get('/health');

        expect(pool.query).toHaveBeenCalledWith('SELECT 1;');
    });
});
