import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, RotateCw, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { generateOtp, isValidEmail, OTP_TTL_MS, sendOtpEmail, type PendingOtp } from '../lib/emailOtp';

interface EmailOTPVerificationProps {
  /** Pre-filled email (e.g. from a signup form). */
  email: string;
  onEmailChange?: (email: string) => void;
  /** Allow editing the email field. */
  editableEmail?: boolean;
  onVerified: () => void;
  title?: string;
  subtitle?: string;
}

const EmailOTPVerification = ({
  email,
  onEmailChange,
  editableEmail = false,
  onVerified,
  title = 'Verify your email',
  subtitle = "We'll send a 6-digit code to your inbox to confirm it's you.",
}: EmailOTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [pending, setPending] = useState<PendingOtp | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      const code = generateOtp();
      await sendOtpEmail(email.trim(), code);
      setPending({ code, email: email.trim(), expiresAt: Date.now() + OTP_TTL_MS });
      setSuccess(`OTP sent to ${email.trim()}. Check your inbox (or console in dev mode).`);
      setCooldown(30);
      setOtp('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP.';
      setError(`Could not send email: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (!pending) {
      setError('Please request an OTP first.');
      return;
    }
    if (Date.now() > pending.expiresAt) {
      setError('OTP expired. Please request a new one.');
      setPending(null);
      return;
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 350));
    if (otp === pending.code) {
      setSuccess('Verified successfully!');
      onVerified();
    } else {
      setError('Wrong OTP. Please try again.');
    }
    setVerifying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto rounded-2xl border border-border bg-card p-6 space-y-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Mail className="w-3 h-3" />
          Email address
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          disabled={!editableEmail || !!pending}
          onChange={(e) => onEmailChange?.(e.target.value)}
        />
      </div>

      {/* Step 1 — Send OTP */}
      {!pending ? (
        <Button
          onClick={handleSendOtp}
          disabled={sending || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {sending ? 'Sending OTP…' : 'Send OTP'}
        </Button>
      ) : (
        /* Step 2 — Enter OTP */
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Enter 6-digit OTP
            </label>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="font-mono text-center text-lg tracking-[0.5em]"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </Button>

          {/* Resend */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={cooldown > 0 || sending}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className="w-3 h-3" />
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div className="text-xs font-medium px-3 py-2 rounded-lg bg-destructive/10 text-destructive">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="text-xs font-medium px-3 py-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
          {success}
        </div>
      )}
    </motion.div>
  );
};

export default EmailOTPVerification;
