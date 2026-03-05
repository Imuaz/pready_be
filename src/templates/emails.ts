/**
 * @module templates/emails
 * @description HTML email templates for transactional emails sent by the application.
 * Each template function accepts string interpolation values and returns a complete HTML string.
 */


/**
 * Produces the HTML body for an email-verification message.
 *
 * @param name            - The recipient's display name.
 * @param verificationUrl - The full verification URL (including token).
 * @returns An HTML string suitable for use as the `html` field of a mail message.
 */
const verificationMailTemplate = (name: string, verificationUrl: string): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to Backend Masterclass!</h1>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #4F46E5;">Hi ${name},</h2>

        <p>Thank you for registering! Please verify your email address to activate your account.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background: #4F46E5; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #4F46E5; word-break: break-all; font-size: 12px;">${verificationUrl}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          This link will expire in 1 hour for security reasons.<br>
          If you didn't create an account, please ignore this email.
        </p>
      </div>
    </body>
    </html>
`;


/**
 * Produces the HTML body for a password-reset email.
 *
 * @param name     - The recipient's display name.
 * @param resetUrl - The full password-reset URL (including token).
 * @returns An HTML string suitable for use as the `html` field of a mail message.
 */
const passwordResetMailTemplate = (name: string, resetUrl: string): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #EF4444, #DC2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Password Reset Request</h1>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #EF4444;">Hi ${name},</h2>

        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background: #EF4444; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #EF4444; word-break: break-all; font-size: 12px;">${resetUrl}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          This link will expire in 1 hour for security reasons.<br>
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    </body>
    </html>
`;


/**
 * Produces the HTML body for a password-changed confirmation email.
 *
 * @param name - The recipient's display name.
 * @returns An HTML string suitable for use as the `html` field of a mail message.
 */
const passwordChangedMailTemplate = (name: string): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #10B981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Password Changed Successfully</h1>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #10B981;">Hi ${name},</h2>

        <p>Your password has been successfully changed.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
`;


/**
 * Produces the HTML body for a generic in-app notification email.
 *
 * @param title     - The notification title (used as the heading).
 * @param message   - The notification body text.
 * @param actionUrl - Optional deep-link URL. When provided, a "View Details" CTA button is rendered.
 * @returns An HTML string suitable for use as the `html` field of a mail message.
 */
const notificationEmailTemplate = (
  title: string,
  message: string,
  actionUrl: string | undefined
): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333; margin-top: 0;">${title}</h2>
        <p style="color: #666; line-height: 1.6;">${message}</p>

        ${actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}"
             style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Details
          </a>
        </div>
        ` : ""}

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          This is an automated notification from Backend Masterclass.
          You can manage your notification preferences in your account settings.
        </p>
      </div>
    </body>
    </html>
`;


export {
  verificationMailTemplate,
  passwordResetMailTemplate,
  passwordChangedMailTemplate,
  notificationEmailTemplate,
};