import createTransporter from "@/config/email.js";
import AppError from "./AppError.js";
import type { EmailOptions } from "@/types/common.js";
import {
    verificationMailTemplate,
    passwordResetMailTemplate,
    passwordChangedMailTemplate
} from "@/templates/emails.js";


/**
 * Send email using configured transporter
 * @param options - Email parameters
 */
const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('📧 Email sent:', info.messageId);

  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new AppError('Failed to send email. Please try again later.', 500);
  }
};

/**
 * Send email verification email
 * @param email - User's email address
 * @param name - User's name
 * @param token - Verification token
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
    subject: 'Verify Your Email Address',
    html
  });
};

/**
 * Send password reset email
 * @param email - User's email address
 * @param name - User's name
 * @param token - Reset token
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
    subject: 'Reset Your Password',
    html
  });
};

/**
 * Send password changed confirmation email
 * @param email - User's email address
 * @param name - User's name
 */
const sendPasswordChangedEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html =  passwordChangedMailTemplate(name);

  await sendEmail({
    to: email,
    subject: 'Your Password Has Been Changed',
    html
  });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};