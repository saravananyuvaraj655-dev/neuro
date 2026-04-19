import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, RotateCw, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  generateOtp,
  isValidEmail,
  OTP_TTL_MS,
  sendOtpEmail,
  type PendingOtp,
} from '../lib/emailOtp';

interface EmailOTPVerificationProps {
  email: string;
  onEmailChange?: (email: string) => void;
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
  subtitle = "We'll send a 6-digit code to your inbox.",
}: EmailOTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [pending, setPending] = useState<PendingOtp | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [sentBanner, setSentBanner] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Auto-focus OTP input when code is sent
  useEffect(() => {
    if (pending && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [pending]);

  const handleSendOtp = async () => {
    setError('');
    setSentBanner('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    try {
      const code = generateOtp();
      await sendOtpEmail(email.trim(), code);
      setPending({ code, email: email.trim(), expiresAt: Date.now() + OTP_TTL_MS });
      setSentBanner(`OTP sent to ${email.trim()}`);
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
    if (!pending) { setError('Request an OTP first.'); return; }
    if (Date.now() > pending.expiresAt) {
      setError('OTP expired. Please request a new one.');
      setPending(null);
      return;
    }
    if (otp.length !== 6) { setError('Enter the full 6-digit code.'); return; }

    setVerifying(true);
    await new Promise((r) => setTimeout(r, 400)); // slight UX delay

    if (otp === pending.code) {
      setVerified(true);
      setSentBanner('');
      setTimeout(() => onVerified(), 600);
    } else {
      setError('Incorrect OTP. Please try again.');
      setOtp('');
      otpInputRef.current?.focus();
    }
    setVerifying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto rounded-2xl border border-border bg-card p-6 space-y-5 shadow-lg"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Email field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Mail className="w-3 h-3" /> Email address
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          disabled={!editableEmail || !!pending || sending}
          onChange={(e) => onEmailChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !pending && handleSendOtp()}
        />
      </div>

      {/* Sent banner */}
      <AnimatePresence>
        {sentBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-2"
          >
            <Mail className="w-3 h-3 shrink-0" />
            {sentBanner} — check your inbox (or browser console in dev mode)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1 — Send OTP button */}
      {!pending ? (
        <Button
          onClick={handleSendOtp}
          disabled={sending || !email.trim()}
          className="w-full"
        >
          {sending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending OTP…</>
            : 'Send OTP'}
        </Button>
      ) : verified ? (
        /* Success state */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-2 py-3 text-green-600 dark:text-green-400 font-semibold"
        >
          <CheckCircle2 className="w-5 h-5" />
          Verified! Redirecting…
        </motion.div>
      ) : (
        /* Step 2 — Enter OTP */
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Enter 6-digit OTP
            </label>
            <Input
              ref={otpInputRef}
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => {
                setError('');
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerify()}
              className="font-mono text-center text-xl tracking-[0.6em] h-12"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {verifying
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
              : 'Verify OTP'}
          </Button>

          {/* Resend */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={cooldown > 0 || sending}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 py-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sending
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</>
              : <><RotateCw className="w-3 h-3" />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</>
            }
          </button>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium px-3 py-2 rounded-lg bg-destructive/10 text-destructive"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailOTPVerification;