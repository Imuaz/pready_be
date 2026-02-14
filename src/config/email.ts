import nodemailer, { Transporter } from "nodemailer";
import type { EmailConfig } from "@/types/common.js";


/**
 * Create email transporter based on environment
 */
const createTransporter = (): Transporter => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  };

  // For production, we may use different config
  // if (process.env.NODE_ENV === 'production') {
  //   config = {
  //     service: 'SendGrid',
  //     auth: {
  //       user: 'apikey',
  //       pass: process.env.SENDGRID_API_KEY || ''
  //     }
  //   };
  // }

  const transporter = nodemailer.createTransport(config);

  // Verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error);
    } else {
        console.log(success)
        console.log('✅ Email server is ready to send messages');
    }
  });

  return transporter;
};

export default createTransporter;