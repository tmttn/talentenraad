// ReCAPTCHA Enterprise verification utility

type EnterpriseAssessmentResponse = {
  name: string;
  event: {
    token: string;
    siteKey: string;
    expectedAction: string;
  };
  riskAnalysis: {
    score: number;
    reasons: string[];
  };
  tokenProperties: {
    valid: boolean;
    hostname: string;
    action: string;
    createTime: string;
    invalidReason?: string;
  };
};

type LegacyVerifyResponse = {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
};

export type RecaptchaResult = {
  success: boolean;
  score: number;
  error?: string;
};

const MIN_SCORE = 0.5;

/**
 * Verify a reCAPTCHA Enterprise token
 * Uses Enterprise Assessment API if RECAPTCHA_PROJECT_ID is set,
 * otherwise falls back to legacy siteverify endpoint
 */
export async function verifyRecaptcha(token: string, action?: string): Promise<RecaptchaResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const projectId = process.env.RECAPTCHA_PROJECT_ID;

  // Skip verification if no secret key
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not set, skipping verification');
    return {success: true, score: 1};
  }

  if (!token) {
    return {success: false, score: 0, error: 'No reCAPTCHA token provided'};
  }

  // Use Enterprise API if project ID is configured
  if (projectId) {
    return verifyWithEnterpriseApi(token, secretKey, projectId, action);
  }

  // Fall back to legacy siteverify endpoint
  return verifyWithLegacyApi(token, secretKey);
}

async function verifyWithEnterpriseApi(
  token: string,
  apiKey: string,
  projectId: string,
  action?: string,
): Promise<RecaptchaResult> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: {
          token,
          siteKey,
          expectedAction: action ?? 'submit',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('reCAPTCHA Enterprise API error:', errorText);
      return {success: false, score: 0, error: 'Failed to verify reCAPTCHA'};
    }

    const data = await response.json() as EnterpriseAssessmentResponse;

    // Check if token is valid
    if (!data.tokenProperties?.valid) {
      const reason = data.tokenProperties?.invalidReason ?? 'Unknown reason';
      return {success: false, score: 0, error: `reCAPTCHA token invalid: ${reason}`};
    }

    // Check if action matches (if provided)
    if (action && data.tokenProperties.action !== action) {
      return {
        success: false,
        score: 0,
        error: `reCAPTCHA action mismatch: expected ${action}, got ${data.tokenProperties.action}`,
      };
    }

    const score = data.riskAnalysis?.score ?? 0;

    // Check if score meets minimum threshold
    if (score < MIN_SCORE) {
      return {
        success: false,
        score,
        error: `reCAPTCHA score too low: ${score}`,
      };
    }

    return {success: true, score};
  } catch (error) {
    console.error('reCAPTCHA Enterprise verification error:', error);
    return {success: false, score: 0, error: 'reCAPTCHA verification failed'};
  }
}

async function verifyWithLegacyApi(token: string, secretKey: string): Promise<RecaptchaResult> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      return {success: false, score: 0, error: 'Failed to verify reCAPTCHA'};
    }

    const data = await response.json() as LegacyVerifyResponse;

    if (!data.success) {
      const errorCodes = data['error-codes']?.join(', ') ?? 'Unknown error';
      return {success: false, score: 0, error: `reCAPTCHA verification failed: ${errorCodes}`};
    }

    // Check if score meets minimum threshold
    if (data.score < MIN_SCORE) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA score too low: ${data.score}`,
      };
    }

    return {success: true, score: data.score};
  } catch (error) {
    console.error('reCAPTCHA legacy verification error:', error);
    return {success: false, score: 0, error: 'reCAPTCHA verification failed'};
  }
}
