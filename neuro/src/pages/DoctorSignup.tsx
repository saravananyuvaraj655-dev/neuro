import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import EmailOTPVerification from '../components/EmailOTPVerification';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface DoctorProfile {
  fullName: string;
  email: string;
  specialization: string;
  hospitalName: string;
  licenseNumber: string;
}

const specializations = [
  'Neurologist', 'Cardiologist', 'General Physician',
  'Endocrinologist', 'Pulmonologist', 'Other',
];

const DoctorSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState<DoctorProfile>({
    fullName: '',
    email: '',
    specialization: '',
    hospitalName: '',
    licenseNumber: '',
  });
  const [formError, setFormError] = useState('');

  const update = (field: keyof DoctorProfile, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setFormError('');
  };

  const canProceed =
    form.fullName.trim() &&
    form.email.trim() &&
    form.specialization &&
    form.hospitalName.trim();

  const handleFormSubmit = () => {
    if (!canProceed) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setStep('otp');
  };

 const handleVerified = () => {
  localStorage.setItem('neurotrack_doctor', JSON.stringify(form));
  localStorage.setItem('neurotrack_role', 'doctor');
  localStorage.setItem('neurotrack_authed_email', form.email.trim()); // ✅ FIX
  navigate('/');
};
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-4"
        >
          <button
            onClick={() => setStep('form')}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to form
          </button>
          <EmailOTPVerification
            email={form.email}
            onVerified={handleVerified}
            title="Verify doctor email"
            subtitle="Confirm your email to complete doctor registration."
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Doctor Registration</h1>
          <p className="text-muted-foreground text-sm mt-1">Join NeuroTrack as a medical professional</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Full Name *
              </label>
              <Input
                placeholder="Dr. Sarah Patel"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="doctor@hospital.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Specialization *
              </label>
              <div className="flex flex-wrap gap-2">
                {specializations.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('specialization', s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.specialization === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Hospital / Clinic *
              </label>
              <Input
                placeholder="Apollo Hospital"
                value={form.hospitalName}
                onChange={(e) => update('hospitalName', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                License Number (optional)
              </label>
              <Input
                placeholder="MCI-12345"
                value={form.licenseNumber}
                onChange={(e) => update('licenseNumber', e.target.value)}
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-destructive font-medium">{formError}</p>
          )}

          <Button
            onClick={handleFormSubmit}
            disabled={!canProceed}
            className="w-full"
          >
            Continue to Email Verification
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default DoctorSignup;