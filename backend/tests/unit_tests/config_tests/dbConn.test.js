import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';

// Shared mock functions
const mockOn = vi.fn();
const mockPoolConstructor = vi.fn();

// Mock pg once at the module level
vi.mock('pg', () => {
    return {
        default: {
            Pool: mockPoolConstructor.mockImplementation(function () {
                this.on = mockOn;
            }),
        },
    };
});

// Mock the reading of .env
vi.mock('dotenv', () => ({
    default: { config: vi.fn() },
}));

describe('dbConn', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();

        delete process.env.DATABASE_URL;
        delete process.env.DB_SSL;
    });

    it('should create Pool with SSL enabled when DB_SSL is true', async () => {
        process.env.DATABASE_URL = 'test_url';
        process.env.DB_SSL = 'true';

        await import('../../../config/dbConn.js');

        expect(mockPoolConstructor).toHaveBeenCalledWith({
            connectionString: 'test_url',
            ssl: { rejectUnauthorized: false },
        });
    });

    it('should disable SSL when DB_SSL is not true', async () => {
        process.env.DATABASE_URL = 'test_url';
        process.env.DB_SSL = 'false';

        await import('../../../config/dbConn.js');

        expect(mockPoolConstructor).toHaveBeenCalledWith({
            connectionString: 'test_url',
            ssl: false,
        });
    });

    it('should attach an error handler to the pool', async () => {
        await import('../../../config/dbConn.js');

        expect(mockOn).toHaveBeenCalledWith(
            'error',
            expect.any(Function)
        );
    });
});
