import emailjs from 'emailjs-com';

// TODO: Replace these with your actual EmailJS credentials.
// Get them from https://dashboard.emailjs.com
export const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
export const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
export const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

/** OTP lifetime in milliseconds (3 minutes). */
export const OTP_TTL_MS = 3 * 60 * 1000;

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
 * Sends an OTP code to the given email via EmailJS.
 * The EmailJS template should accept template variables: `to_email`, `otp_code`, `expires_in`.
 */
export const sendOtpEmail = async (email: string, code: string): Promise<void> => {
  if (
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
  ) {
    // Dev fallback: surface the code so the flow is testable without real keys.
    console.warn(
      `[EmailOTP] EmailJS keys not configured. Dev OTP for ${email}: ${code}`,
    );
    return;
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: email,
      email,
      otp_code: code,
      passcode: code,
      expires_in: '3 minutes',
    },
    EMAILJS_PUBLIC_KEY,
  );
};
