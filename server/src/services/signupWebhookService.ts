import axios from 'axios';
import { config } from '../config/environment';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  const code = error?.code;
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || code === 'ECONNRESET') {
    return true;
  }

  const status = error?.response?.status;
  return status === 429 || (status >= 500 && status <= 599);
};

class SignupWebhookService {
  async sendSignupEmail(payload: {
    email: string;
    eventCode: string;
    languagePreference?: string;
    customerNumber?: string;
  }): Promise<void> {
    const url = config.webhooks.signupDataHookUrl;
    if (!url) {
      console.warn('⚠️ SIGNUP_DATAHOOK_URL not configured. Skipping signup webhook.');
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.webhooks.signupDataHookAuth) {
      headers.Authorization = config.webhooks.signupDataHookAuth;
    }

    const requestBody = {
      email: payload.email,
      eventCode: payload.eventCode,
      languagePreference: payload.languagePreference || null,
      customerNumber: payload.customerNumber || null,
      source: 'wk2026-signup',
      createdAt: new Date().toISOString(),
    };

    const maxRetries = Math.max(0, config.webhooks.signupDataHookMaxRetries);
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt += 1;
      const startedAt = Date.now();

      try {
        const response = await axios.post(url, requestBody, {
          headers,
          timeout: config.webhooks.signupDataHookTimeoutMs,
        });

        const durationMs = Date.now() - startedAt;
        console.log(
          `✅ Signup webhook sent for ${payload.email} (attempt ${attempt}/${maxRetries + 1}, status ${response.status}, ${durationMs}ms)`
        );
        return;
      } catch (error: any) {
        const durationMs = Date.now() - startedAt;
        const retryable = isRetryableError(error);
        const message = error?.response?.data || error?.message || error;

        console.error(
          `❌ Signup webhook attempt ${attempt}/${maxRetries + 1} failed for ${payload.email} (${durationMs}ms):`,
          message
        );

        if (!retryable || attempt > maxRetries) {
          // Non-blocking by design: registration should still succeed
          return;
        }

        const backoffMs = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms, 2000ms...
        await sleep(backoffMs);
      }
    }
  }
}

export default new SignupWebhookService();
