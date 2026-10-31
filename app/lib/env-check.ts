const minimumSecretLength = 32;

/**
 * Fails fast in production when required configuration is missing, listing
 * every problem at once. Skipped in development/test and during `next build`.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production' || env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const problems: string[] = [];

  const secret = env.AUTH_SECRET ?? '';
  if (secret.length < minimumSecretLength) {
    problems.push(`AUTH_SECRET ontbreekt of is korter dan ${minimumSecretLength} tekens`);
  }

  for (const name of ['SITE_URL', 'SMTP_HOST', 'SMTP_FROM']) {
    if (!env[name]?.trim()) {
      problems.push(`${name} ontbreekt`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Ongeldige configuratie:\n- ${problems.join('\n- ')}`);
  }
}
