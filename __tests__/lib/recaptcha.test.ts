import {verifyRecaptcha} from '../../app/lib/recaptcha';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('verifyRecaptcha', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {...originalEnv};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns success when RECAPTCHA_SECRET_KEY is not set (dev mode)', async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const result = await verifyRecaptcha('test-token');

    expect(result).toEqual({success: true, score: 1});
    expect(consoleSpy).toHaveBeenCalledWith('RECAPTCHA_SECRET_KEY not set, skipping verification');
    consoleSpy.mockRestore();
  });

  it('returns failure when token is empty', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';

    const result = await verifyRecaptcha('');

    expect(result).toEqual({success: false, score: 0, error: 'No reCAPTCHA token provided'});
  });

  it('returns success when verification passes with high score', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        score: 0.9,
        action: 'submit',
        challenge_ts: '2024-01-01T00:00:00Z',
        hostname: 'localhost',
      }),
    });

    const result = await verifyRecaptcha('valid-token');

    expect(result).toEqual({success: true, score: 0.9});
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.google.com/recaptcha/api/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      }),
    );
  });

  it('returns failure when score is below threshold', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        score: 0.3,
        action: 'submit',
        challenge_ts: '2024-01-01T00:00:00Z',
        hostname: 'localhost',
      }),
    });

    const result = await verifyRecaptcha('low-score-token');

    expect(result.success).toBe(false);
    expect(result.score).toBe(0.3);
    expect(result.error).toContain('score too low');
  });

  it('returns failure when Google API returns success: false', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response', 'timeout-or-duplicate'],
      }),
    });

    const result = await verifyRecaptcha('invalid-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('invalid-input-response, timeout-or-duplicate');
  });

  it('returns failure when fetch response is not ok', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await verifyRecaptcha('test-token');

    expect(result).toEqual({success: false, score: 0, error: 'Failed to verify reCAPTCHA'});
  });

  it('returns failure when fetch throws error', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await verifyRecaptcha('test-token');

    expect(result).toEqual({success: false, score: 0, error: 'reCAPTCHA verification failed'});
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles missing error-codes in failure response', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
      }),
    });

    const result = await verifyRecaptcha('bad-token');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown error');
  });

  it('passes correct parameters to Google API', async () => {
    process.env.RECAPTCHA_SECRET_KEY = 'my-secret-key';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({success: true, score: 0.9}),
    });

    await verifyRecaptcha('my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.google.com/recaptcha/api/siteverify',
      expect.objectContaining({
        body: expect.any(URLSearchParams),
      }),
    );

    const callArgs = mockFetch.mock.calls[0][1] as {body: URLSearchParams};
    expect(callArgs.body.get('secret')).toBe('my-secret-key');
    expect(callArgs.body.get('response')).toBe('my-token');
  });
});
