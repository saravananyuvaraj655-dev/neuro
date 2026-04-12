import { useState } from 'react';
import { Search, User, Shield, Eye, ArrowLeft, Phone, Hash, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import VitalCard from '@/components/VitalCard';
import ECGChart from '@/components/ECGChart';
import StatusBanner from '@/components/StatusBanner';
import FallDetection from '@/components/FallDetection';
import { fetchBlynkVitals } from '@/lib/blynk';
import { getOverallStatus, getFirstAidSuggestions, type VitalSign } from '@/lib/vitals';
import { useEffect } from 'react';

// Mock registered patients (in real app this would come from a database)
const registeredPatients = [
  { id: 'P-1001', name: 'Arjun Mehta', age: '55', gender: 'Male', bloodGroup: 'B+', phone: '+91-98765-43210', emergencyContact: 'Sunita Mehta', emergencyPhone: '+91-98765-43200', allergies: 'Penicillin', conditions: 'Hypertension, Diabetes', blynkToken: '', doctor: 'Dr. Patel' },
  { id: 'P-1023', name: 'Amit Deshmukh', age: '58', gender: 'Male', bloodGroup: 'O+', phone: '+91-98765-43211', emergencyContact: 'Rekha Deshmukh', emergencyPhone: '+91-98765-43201', allergies: 'None', conditions: 'Epilepsy', blynkToken: '', doctor: 'Dr. Kumar' },
  { id: 'P-1042', name: 'Rajesh Verma', age: '67', gender: 'Male', bloodGroup: 'A-', phone: '+91-98765-43212', emergencyContact: 'Meera Verma', emergencyPhone: '+91-98765-43202', allergies: 'Sulfa drugs', conditions: 'Parkinson\'s, Heart Disease', blynkToken: '', doctor: 'Dr. Sharma' },
  { id: 'P-1055', name: 'Priya Iyer', age: '45', gender: 'Female', bloodGroup: 'AB+', phone: '+91-98765-43213', emergencyContact: 'Ramesh Iyer', emergencyPhone: '+91-98765-43203', allergies: 'Latex', conditions: 'Migraine', blynkToken: '', doctor: 'Dr. Chen' },
  { id: 'P-1070', name: 'Sunita Rao', age: '62', gender: 'Female', bloodGroup: 'O-', phone: '+91-98765-43214', emergencyContact: 'Vikram Rao', emergencyPhone: '+91-98765-43204', allergies: 'None', conditions: 'Alzheimer\'s', blynkToken: '', doctor: 'Dr. Patel' },
  { id: 'P-1087', name: 'Lakshmi Nair', age: '74', gender: 'Female', bloodGroup: 'A+', phone: '+91-98765-43215', emergencyContact: 'Anil Nair', emergencyPhone: '+91-98765-43205', allergies: 'Aspirin', conditions: 'Stroke recovery, Hypertension', blynkToken: '', doctor: 'Dr. Kumar' },
];

type ViewMode = 'list' | 'otp-verify' | 'patient-vitals';

const PatientLookup = () => {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<typeof registeredPatients[0] | null>(null);

  // OTP flow
  const [patientIdInput, setPatientIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Live vitals for viewed patient
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [fallDetected, setFallDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const filtered = registeredPatients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.phone.includes(query)
  );

  const statusBadge = (conditions: string) => {
    if (conditions.toLowerCase().includes('stroke') || conditions.toLowerCase().includes('heart')) return 'status-badge-abnormal';
    if (conditions.toLowerCase().includes('hypertension') || conditions.toLowerCase().includes('epilepsy')) return 'status-badge-warning';
    return 'status-badge-normal';
  };

  const handleSendOtp = () => {
    const found = registeredPatients.find(
      p => p.id.toLowerCase() === patientIdInput.trim().toLowerCase() && p.phone.replace(/[\s-]/g, '').includes(phoneInput.replace(/[\s-]/g, ''))
    );
    if (!found) {
      setOtpError('No patient found with this ID and phone number combination.');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(otp);
    setTimeout(() => {
      setOtpLoading(false);
      setOtpSent(true);
      setSelectedPatient(found);
      // In production, OTP would be sent via SMS. For demo, we show it.
      console.log(`OTP for ${found.name}: ${otp}`);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp) {
      setOtpVerified(true);
      setOtpError('');
      setTimeout(() => setViewMode('patient-vitals'), 800);
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  const handleViewPatient = (patient: typeof registeredPatients[0]) => {
    setSelectedPatient(patient);
    setPatientIdInput(patient.id);
    setPhoneInput(patient.phone);
    setViewMode('otp-verify');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedPatient(null);
    setOtpSent(false);
    setOtpInput('');
    setOtpVerified(false);
    setOtpError('');
    setGeneratedOtp('');
    setPatientIdInput('');
    setPhoneInput('');
    setVitals([]);
    setFallDetected(false);
    setIsConnected(false);
  };

  // Fetch vitals when viewing patient (using their Blynk token or demo data)
  useEffect(() => {
    if (viewMode !== 'patient-vitals' || !selectedPatient) return;

    if (selectedPatient.blynkToken) {
      const fetchData = async () => {
        const result = await fetchBlynkVitals(selectedPatient.blynkToken);
        if (result) {
          setVitals(result.vitals);
          setFallDetected(result.fallDetected);
          setIsConnected(result.isOnline);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [viewMode, selectedPatient]);

  const overallStatus = getOverallStatus(vitals);
  const firstAid = getFirstAidSuggestions(vitals);

  if (viewMode === 'patient-vitals' && selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="font-display text-xl font-bold text-foreground">
            Patient: {selectedPatient.name} ({selectedPatient.id})
          </h2>
        </div>

        {/* Patient Info Card */}
        <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Patient Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Name:</span><p className="font-medium text-foreground">{selectedPatient.name}</p></div>
            <div><span className="text-muted-foreground">Age / Gender:</span><p className="font-medium text-foreground">{selectedPatient.age} / {selectedPatient.gender}</p></div>
            <div><span className="text-muted-foreground">Blood Group:</span><p className="font-medium text-foreground">🩸 {selectedPatient.bloodGroup}</p></div>
            <div><span className="text-muted-foreground">Phone:</span><p className="font-medium text-foreground">{selectedPatient.phone}</p></div>
            <div><span className="text-muted-foreground">Emergency Contact:</span><p className="font-medium text-foreground">{selectedPatient.emergencyContact} — {selectedPatient.emergencyPhone}</p></div>
            <div><span className="text-muted-foreground">Assigned Doctor:</span><p className="font-medium text-foreground">{selectedPatient.doctor}</p></div>
            <div><span className="text-muted-foreground">Conditions:</span><p className="font-medium text-foreground">{selectedPatient.conditions || 'None'}</p></div>
            <div><span className="text-muted-foreground">Allergies:</span><p className="font-medium text-destructive">{selectedPatient.allergies || 'None'}</p></div>
          </div>
        </div>

        {/* Live Vitals or Placeholder */}
        {vitals.length > 0 ? (
          <div className="space-y-4">
            <StatusBanner status={overallStatus} firstAidSuggestions={firstAid} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {vitals.map((v, i) => (
                <VitalCard key={v.id} vital={v} index={i} />
              ))}
              <FallDetection fallDetected={fallDetected} />
            </div>
            <ECGChart />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-muted-foreground text-sm">No live Blynk device linked to this patient.</p>
            <p className="text-xs text-muted-foreground mt-1">Live vitals will appear here when the patient's IoT device is connected.</p>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'otp-verify') {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="font-display text-xl font-bold text-foreground">Verify Patient Access</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-5" style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Enter Patient ID and registered phone number to send OTP for verification.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. P-1001"
                  value={patientIdInput}
                  onChange={e => { setPatientIdInput(e.target.value); setOtpError(''); }}
                  className="pl-9"
                  disabled={otpSent}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. +91-98765-43210"
                  value={phoneInput}
                  onChange={e => { setPhoneInput(e.target.value); setOtpError(''); }}
                  className="pl-9"
                  disabled={otpSent}
                />
              </div>
            </div>
          </div>

          {otpError && <p className="text-xs text-destructive">{otpError}</p>}

          {!otpSent ? (
            <Button
              onClick={handleSendOtp}
              disabled={!patientIdInput.trim() || !phoneInput.trim() || otpLoading}
              className="w-full"
            >
              {otpLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending OTP...</> : 'Send OTP'}
            </Button>
          ) : !otpVerified ? (
            <div className="space-y-3">
              <p className="text-xs text-primary font-medium">✅ OTP sent to {selectedPatient?.phone}. (Demo OTP: {generatedOtp})</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Enter OTP</label>
                <Input
                  placeholder="4-digit OTP"
                  value={otpInput}
                  onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setOtpError(''); }}
                  maxLength={4}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                />
              </div>
              <Button onClick={handleVerifyOtp} disabled={otpInput.length !== 4} className="w-full">
                Verify & View Patient
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Verified! Loading patient data...</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Default: Patient list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Patient Lookup</h2>
        </div>
        <Button size="sm" onClick={() => setViewMode('otp-verify')}>
          <Shield className="w-3.5 h-3.5 mr-1" /> Verify & View Patient
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, ID, or phone..." className="pl-9" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.id} · {p.gender} · Age {p.age} · {p.bloodGroup} · {p.doctor}</p>
                <p className="text-xs text-muted-foreground">{p.conditions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={statusBadge(p.conditions)}>
                {p.conditions.includes('Stroke') || p.conditions.includes('Heart') ? 'Critical' : p.conditions.includes('Hypertension') || p.conditions.includes('Epilepsy') ? 'Monitor' : 'Stable'}
              </span>
              <Button size="sm" variant="outline" onClick={() => handleViewPatient(p)}>
                <Eye className="w-3.5 h-3.5 mr-1" /> View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientLookup;
