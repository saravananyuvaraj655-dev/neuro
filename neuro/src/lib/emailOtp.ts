import emailjs from 'emailjs-com';

export const EMAILJS_SERVICE_ID = 'service_r4p6a26';
export const EMAILJS_TEMPLATE_ID = 'template_viwmsf8';
export const EMAILJS_PUBLIC_KEY = 'd6EJWrpowS2zmRQd7'; // Replace with your actual public key

/** OTP lifetime in milliseconds (5 minutes). */
export const OTP_TTL_MS = 5 * 60 * 1000;

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
 * Sends a 6-digit OTP to the given email via EmailJS.
 * Template params: { email, otp }
 */
export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  // Always log for dev/fallback visibility
  console.log(`[EmailOTP] OTP for ${email}: ${code}`);

  if (EMAILJS_PUBLIC_KEY === 'd6EJWrpowS2zmRQd7') {
    console.warn('[EmailOTP] Public key not configured — OTP logged to console only.');
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      email,       // matches {{email}} in template
      otp: code,   // matches {{otp}} in template
    },
    EMAILJS_PUBLIC_KEY,
  );
};