import {
    describe,
    it,
    expect,
    vi,
} from 'vitest';
import corsOptions from '../../../config/corsOptions.js';

describe('corsOptions origin function', () => {
    it('should allow whitelisted origin', () => {
        // This creates a fake callback function
        const callback = vi.fn();

        // Now run the origin function with an allowed origin from the whitelist
        corsOptions.origin('https://coffee-shop-jukebox-frontend.onrender.com', callback);

        // Callback should have been called with success
        expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow requests with no origin', () => {
        const callback = vi.fn();
        corsOptions.origin(undefined, callback);
        expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-whitelisted origin', () => {
        const callback = vi.fn();
        corsOptions.origin('https://fake-site.com', callback);
        
        // Get the callback's first argument
        const firstArgument = callback.mock.calls[0][0];

        // The first argument should be an Error
        expect(firstArgument).toBeInstanceOf(Error);

        // The message should match the not-allowed string
        expect(firstArgument.message).toBe('Not allowed by CORS');
    });
});
