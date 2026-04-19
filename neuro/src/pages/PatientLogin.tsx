import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Activity, Stethoscope } from 'lucide-react';
import EmailOTPVerification from '../components/EmailOTPVerification';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

 const handleVerified = () => {
  const userEmail = email.trim().toLowerCase();

  // Get patient data
  const savedPatient = localStorage.getItem('neurotrack_patient');

 

  

  // Save auth
  localStorage.setItem('neurotrack_authed_email', userEmail);

  // Force patient role
  localStorage.setItem('neurotrack_role', 'patient');

  console.log("✅ Patient login success");

  navigate('/');
};
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">NeuroTrack</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Patient login
          </p>
        </div>

        {/* Role indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Patient login</span>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Doctor login</span>
          </div>
        </div>

        <EmailOTPVerification
          email={email}
          onEmailChange={setEmail}
          editableEmail
          onVerified={handleVerified}
          title="Welcome back"
          subtitle="Enter your email to receive a one-time login code."
        />

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            New patient?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            New doctor?{' '}
            <Link to="/doctor-signup" className="text-primary font-semibold hover:underline">
              Doctor registration
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;