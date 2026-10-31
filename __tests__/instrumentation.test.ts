// @vitest-environment node
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const migrate = vi.hoisted(() => ({runMigrations: vi.fn()}));
vi.mock('@lib/db/migrate', () => migrate);
vi.mock('@lib/db', () => ({db: {}}));

const {register} = await import('../instrumentation');

describe('register', () => {
  let exit: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');
    vi.stubEnv('AUTH_SECRET', 'a'.repeat(40));
    vi.stubEnv('SITE_URL', 'https://example.test');
    vi.stubEnv('SMTP_HOST', 'smtp.example.test');
    vi.stubEnv('SMTP_FROM', 'noreply@example.test');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    migrate.runMigrations.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('exits with code 1 in production when migrations fail', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    migrate.runMigrations.mockImplementation(() => {
      throw new Error('boom');
    });

    // process.exit is mocked, so register falls through to the rethrow.
    await expect(register()).rejects.toThrow('boom');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('exits in production when the environment is invalid', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AUTH_SECRET', '');

    await expect(register()).rejects.toThrow(/AUTH_SECRET/);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('rethrows without exiting in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    migrate.runMigrations.mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(register()).rejects.toThrow('boom');
    expect(exit).not.toHaveBeenCalled();
  });

  it('never exits during next build', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    migrate.runMigrations.mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(register()).rejects.toThrow('boom');
    expect(exit).not.toHaveBeenCalled();
  });

  it('runs migrations on success', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await register();
    expect(migrate.runMigrations).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
  });
});
