import request from 'supertest';
import {
    describe,
    it,
    expect,
} from 'vitest';

import app from '../../../app.js';


// NEED TO CHANGE THIS TEST LATER WHEN ADDING 404 MIDDLEWARE
describe('Application routing', () => {
    it('should return 404 for unknown route', async () => {
        const response = await request(app).get('/invalid-route');

        expect(response.status).toBe(404);
    });
});