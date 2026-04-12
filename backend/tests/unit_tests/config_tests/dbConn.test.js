import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';

// Mock the reading of .env
vi.mock('dotenv', () => ({
    default: { config: vi.fn() },
}));

describe('dbConn', () => {
    beforeEach(() => {
        // This is important to re-import fresh each time
        vi.resetModules();
    });

    it('should create Pool with SSL enabled when DB_SSL is true', async () => {
        process.env.DATABASE_URL = 'test_url';
        process.env.DB_SSL = 'true';

        const mockOn = vi.fn();

        vi.mock('pg', () => ({
            default: {
                Pool: vi.fn(() => ({
                    on: mockOn,
                })),
            },
        }));

        const module = await import('../../../config/dbConn.js');
        const { Pool } = (await import('pg')).default;

        expect(Pool.toHaveBeenCalledWith({
            connectionString: 'test_url',
            ssl: { rejectUnauthorized: false },
        }));
    });

    it('should disable SSL when DB_SSL is not true', async () => {
        process.env.DATABASE_URL = 'test_url';
        process.env.DB_SSL = 'false';

        const mockOn = vi.fn();

        vi.mock('pg', () => ({
            default: {
                Pool: vi.fn(() => ({
                    on: mockOn,
                })),
            },
        }));

        await import('../../../config/dbConn.js');
        const { Pool } = (await import('pg')).default;

        expect(Pool).toHaveBeenCalledWith({
            connectionString: 'test_url',
            ssl: false,
        });
    });

    it('should attach an error handler to the pool', async () => {
        const mockOn = vi.fn();

        vi.mock('pg', () => ({
            default: {
                Pool: vi.fn(() => ({
                    on: mockOn,
                })),
            },
        }));

        await import('../../../config/dbConn.js');

        expect(mockOn).toHaveBeenCalledWith(
            'error',
            expect.any(Function)
        );
    });
});