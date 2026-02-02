import nodemailer from 'nodemailer';
import { config } from '../config/environment';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if SMTP is configured
    if (!config.smtp.user || config.smtp.user === 'your-email@gmail.com') {
      console.warn('⚠️  SMTP not configured - emails will be logged to console only');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password,
        },
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!this.transporter) {
        // Log to console if SMTP not configured
        console.log('\n📧 EMAIL (not sent - SMTP not configured)');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.text || options.html);
        console.log('---\n');
        return;
      }

      await this.transporter.sendMail({
        from: config.smtp.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string,
    language: 'en' | 'nl' = 'en'
  ): Promise<void> {
    const verificationUrl = `${config.client.url}/verify-email?token=${verificationToken}`;

    const templates = {
      en: {
        subject: 'Verify your email - World Cup 2026 Prediction Game',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #9B1915; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background-color: #9B1915; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to World Cup 2026!</h1>
              </div>
              <div class="content">
                <p>Hi ${firstName},</p>
                <p>Thank you for registering for the World Cup 2026 Prediction Game! 🏆</p>
                <p>Please verify your email address to complete your registration and start making predictions.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create this account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>World Cup 2026 Prediction Game - Kramp Group</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hi ${firstName},

Thank you for registering for the World Cup 2026 Prediction Game!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

---
World Cup 2026 Prediction Game - Kramp Group
        `,
      },
      nl: {
        subject: 'Verifieer je e-mailadres - Wereldkampioenschap 2026 Voorspellingsspel',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #9B1915; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background-color: #9B1915; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welkom bij Wereldkampioenschap 2026!</h1>
              </div>
              <div class="content">
                <p>Hoi ${firstName},</p>
                <p>Bedankt voor je registratie voor het Wereldkampioenschap 2026 Voorspellingsspel! 🏆</p>
                <p>Verifieer je e-mailadres om je registratie te voltooien en te beginnen met voorspellingen.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verifieer E-mailadres</a>
                </p>
                <p>Of kopieer en plak deze link in je browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p><strong>Deze link verloopt over 24 uur.</strong></p>
                <p>Als je dit account niet hebt aangemaakt, negeer deze e-mail dan.</p>
              </div>
              <div class="footer">
                <p>Wereldkampioenschap 2026 Voorspellingsspel - Kramp Group</p>
                <p>Dit is een geautomatiseerde e-mail, graag niet beantwoorden.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hoi ${firstName},

Bedankt voor je registratie voor het Wereldkampioenschap 2026 Voorspellingsspel!

Verifieer je e-mailadres door op de onderstaande link te klikken:
${verificationUrl}

Deze link verloopt over 24 uur.

Als je dit account niet hebt aangemaakt, negeer deze e-mail dan.

---
Wereldkampioenschap 2026 Voorspellingsspel - Kramp Group
        `,
      },
    };

    const template = templates[language];

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    language: 'en' | 'nl' = 'en'
  ): Promise<void> {
    const appUrl = config.client.url;

    const templates = {
      en: {
        subject: 'Welcome to World Cup 2026 Prediction Game! 🏆',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #9B1915; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background-color: #9B1915; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Email Verified!</h1>
              </div>
              <div class="content">
                <p>Hi ${firstName},</p>
                <p>Your email has been successfully verified! You can now make predictions for all matches.</p>
                <h3>What's Next?</h3>
                <ul>
                  <li>📝 Submit your predictions for all 64 matches</li>
                  <li>🏆 Answer bonus questions for extra points</li>
                  <li>📊 Track your position on the leaderboard</li>
                  <li>🥇 Compete for prizes!</li>
                </ul>
                <p><strong>Important Dates:</strong></p>
                <ul>
                  <li>Prediction deadline: June 11, 2026 at 23:00</li>
                  <li>Tournament starts: June 11, 2026</li>
                  <li>Final match: July 19, 2026</li>
                </ul>
                <p style="text-align: center;">
                  <a href="${appUrl}/my-prediction" class="button">Start Predicting Now</a>
                </p>
              </div>
              <div class="footer">
                <p>Good luck with your predictions! 🍀</p>
                <p>World Cup 2026 Prediction Game - Kramp Group</p>
              </div>
            </div>
          </body>
          </html>
        `,
      },
      nl: {
        subject: 'Welkom bij het Wereldkampioenschap 2026 Voorspellingsspel! 🏆',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #9B1915; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background-color: #f9f9f9; }
              .button { display: inline-block; padding: 12px 30px; background-color: #9B1915; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 E-mail Geverifieerd!</h1>
              </div>
              <div class="content">
                <p>Hoi ${firstName},</p>
                <p>Je e-mail is succesvol geverifieerd! Je kunt nu voorspellingen doen voor alle wedstrijden.</p>
                <h3>Wat nu?</h3>
                <ul>
                  <li>📝 Doe je voorspellingen voor alle 64 wedstrijden</li>
                  <li>🏆 Beantwoord bonusvragen voor extra punten</li>
                  <li>📊 Volg je positie op het klassement</li>
                  <li>🥇 Strijd om prijzen!</li>
                </ul>
                <p><strong>Belangrijke Data:</strong></p>
                <ul>
                  <li>Voorspelling deadline: 11 juni 2026 om 23:00</li>
                  <li>Toernooi start: 11 juni 2026</li>
                  <li>Finale: 19 juli 2026</li>
                </ul>
                <p style="text-align: center;">
                  <a href="${appUrl}/my-prediction" class="button">Begin Nu Met Voorspellen</a>
                </p>
              </div>
              <div class="footer">
                <p>Veel succes met je voorspellingen! 🍀</p>
                <p>Wereldkampioenschap 2026 Voorspellingsspel - Kramp Group</p>
              </div>
            </div>
          </body>
          </html>
        `,
      },
    };

    const template = templates[language];

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });
  }
}

export default new EmailService();
