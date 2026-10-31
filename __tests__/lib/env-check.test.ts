import {describe, expect, it} from 'vitest';
import {assertProductionEnv} from '@lib/env-check';

const valid = {
  NODE_ENV: 'production',
  AUTH_SECRET: 'a'.repeat(32),
  SITE_URL: 'https://talentenraad.be',
  SMTP_HOST: 'smtp.example.com',
  SMTP_FROM: 'noreply@talentenraad.be',
  ADMIN_EMAILS: 'admin@talentenraad.be',
} as unknown as NodeJS.ProcessEnv;

describe('assertProductionEnv', () => {
  it('accepts a complete production environment', () => {
    expect(() => {
      assertProductionEnv(valid);
    }).not.toThrow();
  });

  it('names every missing variable', () => {
    expect(() => {
      assertProductionEnv({NODE_ENV: 'production'} as unknown as NodeJS.ProcessEnv);
    }).toThrow(/AUTH_SECRET[\s\S]*SITE_URL[\s\S]*SMTP_HOST[\s\S]*SMTP_FROM[\s\S]*ADMIN_EMAILS/);
  });

  it('rejects blank ADMIN_EMAILS', () => {
    expect(() => {
      assertProductionEnv({...valid, ADMIN_EMAILS: '  '});
    }).toThrow(/ADMIN_EMAILS/);
  });

  it('rejects a short AUTH_SECRET', () => {
    expect(() => {
      assertProductionEnv({...valid, AUTH_SECRET: 'short'});
    }).toThrow(/AUTH_SECRET/);
  });

  it('does nothing outside production or during the build', () => {
    expect(() => {
      assertProductionEnv({NODE_ENV: 'development'} as unknown as NodeJS.ProcessEnv);
    }).not.toThrow();
    expect(() => {
      assertProductionEnv({NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build'} as unknown as NodeJS.ProcessEnv);
    }).not.toThrow();
  });
});
