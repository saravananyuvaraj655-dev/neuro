import emailjs from 'emailjs-com';

export const EMAILJS_SERVICE_ID = 'service_r4p6a26';
export const EMAILJS_TEMPLATE_ID = 'template_viwmsf8';
export const EMAILJS_PUBLIC_KEY = 'd6EJWrpowS2zmRQd7'; // Replace with your actual key

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface PendingOtp {
  code: string;
  email: string;
  expiresAt: number;
}

export const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/**
 * Sends OTP via EmailJS.
 * Template variables: {{ email }}, {{ otp }}
 * Always logs to console as fallback for development.
 */
export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  // Always log — useful in dev when keys aren't set
  console.log(`[NeuroTrack OTP] Code for ${email}: ${code}`);
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    { email, otp: code },
    EMAILJS_PUBLIC_KEY,
  );
};