import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PatientRegistration from '../components/PatientRegistration';
import EmailOTPVerification from '../components/EmailOTPVerification';

interface PatientFormData {
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  contactNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactRelation: string;
  address: string;
  knownAllergies: string;
  chronicConditions: string;
  currentMedications: string;
  preferredDoctor: string;
  preferredHospital: string;
  blynkAuthToken: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [pendingProfile, setPendingProfile] = useState<PatientFormData | null>(null);

  const handleRegisterAttempt = (data: PatientFormData) => {
    // Hold the data; do NOT save until OTP verifies.
    setPendingProfile(data);
  };

  const handleVerified = () => {
    if (!pendingProfile) return;
    localStorage.setItem('neurotrack_patient', JSON.stringify(pendingProfile));
    localStorage.setItem('neurotrack_role', 'patient');
    localStorage.setItem('neurotrack_authed_email', pendingProfile.email);
    navigate('/');
  };

  if (pendingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-4"
        >
          <button
            onClick={() => setPendingProfile(null)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to form
          </button>
          <EmailOTPVerification
            email={pendingProfile.email}
            onVerified={handleVerified}
            title="Confirm your email"
            subtitle="We need to verify your email before creating your account."
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <PatientRegistration onRegister={handleRegisterAttempt} />
      <p className="text-center text-xs text-muted-foreground pb-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
