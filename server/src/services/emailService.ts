class EmailService {
  /**
   * Email sending is intentionally disabled.
   * Kept as no-op to preserve existing auth flow hooks.
   */
  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
    language: string = 'en'
  ): Promise<void> {
    console.log('📭 Verification email disabled (SMTP removed)', {
      email,
      firstName,
      verificationToken: verificationToken ? '[token-present]' : '[token-missing]',
      language,
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    language: string = 'en'
  ): Promise<void> {
    console.log('📭 Welcome email disabled (SMTP removed)', {
      email,
      firstName,
      language,
    });
  }
}

export default new EmailService();
