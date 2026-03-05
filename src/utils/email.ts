/**
 * @module utils/email
 * @description Email sending utilities using the configured Nodemailer transporter.
 */
import createTransporter from "@/config/email.js";
import AppError from "./AppError.js";
import type { EmailOptions } from "@/types/common.js";
import type { INotification } from "@/types/notification.js";
import {
  verificationMailTemplate,
  passwordResetMailTemplate,
  passwordChangedMailTemplate,
  notificationEmailTemplate,
} from "@/templates/emails.js";


/**
 * Sends an email using the configured transporter.
 *
 * @param options - Email parameters (to, subject, html, text).
 * @throws {AppError} 500 if the email cannot be dispatched by the transporter.
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new AppError("Failed to send email. Please try again later.", 500);
  }
};


/**
 * Sends an email verification link to a newly registered user.
 *
 * @param email - The user's email address.
 * @param name  - The user's display name (used in the greeting).
 * @param token - The plain-text verification token (not hashed).
 */
const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = verificationMailTemplate(name, verificationUrl);

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
  });
};


/**
 * Sends a password reset link to the user's email address.
 *
 * @param email - The user's email address.
 * @param name  - The user's display name (used in the greeting).
 * @param token - The plain-text reset token (not hashed).
 */
const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = passwordResetMailTemplate(name, resetUrl);

  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
  });
};


/**
 * Sends a confirmation email after a successful password change.
 *
 * @param email - The user's email address.
 * @param name  - The user's display name (used in the greeting).
 */
const sendPasswordChangedEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = passwordChangedMailTemplate(name);

  await sendEmail({
    to: email,
    subject: "Your Password Has Been Changed",
    html,
  });
};


/**
 * Sends an email notification to a user.
 *
 * The `recipientEmail` parameter is required because the `recipient` field on
 * {@link INotification} is stored as an ObjectId reference and may not be
 * populated at the call site.
 *
 * @param notification     - The notification document to render.
 * @param recipientEmail   - The resolved email address of the recipient.
 */
const sendEmailNotification = async (
  notification: INotification,
  recipientEmail: string
): Promise<void> => {
  const html = notificationEmailTemplate(
    notification.title,
    notification.message,
    notification.actionUrl
  );

  await sendEmail({
    to: recipientEmail,
    subject: notification.title,
    html,
  });

  console.log(`📧 Email notification sent to ${recipientEmail}`);
};


export {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmailNotification,
};