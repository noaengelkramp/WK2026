import axios from 'axios';
import { config } from '../config/environment';

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

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.webhooks.signupDataHookAuth) {
        headers.Authorization = config.webhooks.signupDataHookAuth;
      }

      await axios.post(
        url,
        {
          email: payload.email,
          eventCode: payload.eventCode,
          languagePreference: payload.languagePreference || null,
          customerNumber: payload.customerNumber || null,
          source: 'wk2026-signup',
          createdAt: new Date().toISOString(),
        },
        {
          headers,
          timeout: 10000,
        }
      );

      console.log(`✅ Signup webhook sent for ${payload.email}`);
    } catch (error: any) {
      console.error('❌ Failed to send signup webhook:', error?.response?.data || error?.message || error);
      // Non-blocking by design: registration should still succeed
    }
  }
}

export default new SignupWebhookService();
