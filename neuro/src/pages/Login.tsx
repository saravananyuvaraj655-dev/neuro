import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import EmailOTPVerification from '../components/EmailOTPVerification';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleVerified = () => {
    localStorage.setItem('neurotrack_authed_email', email.trim());
    // Preserve existing role or default to patient if profile exists
    const hasProfile = !!localStorage.getItem('neurotrack_patient');
    if (!localStorage.getItem('neurotrack_role')) {
      localStorage.setItem('neurotrack_role', hasProfile ? 'patient' : 'doctor');
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Login to NeuroTrack with your email</p>
        </div>

        <EmailOTPVerification
          email={email}
          onEmailChange={setEmail}
          editableEmail
          onVerified={handleVerified}
          title="Login with email"
          subtitle="Enter your registered email to receive a 6-digit OTP."
        />

        <p className="text-center text-xs text-muted-foreground">
          New to NeuroTrack?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
