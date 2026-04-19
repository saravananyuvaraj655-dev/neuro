import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Heart, Shield, Activity, Loader2, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { validateBlynkToken } from '../lib/blynk';

interface PatientFormData {
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  contactNumber: string;
  email: string; // ✅ ADD THIS LINE
  emergencyContactName: string;
  emergencyContactNumber: string;
  caregiverEmail: string;
  emergencyContactRelation: string;
  address: string;
  knownAllergies: string;
  chronicConditions: string;
  currentMedications: string;
  preferredDoctor: string;
  preferredHospital: string;
  blynkAuthToken: string;
}

interface PatientRegistrationProps {
  onRegister: (data: PatientFormData) => void;
}

const initialForm: PatientFormData = {
  fullName: '',
  age: '',
  gender: '',
  bloodGroup: '',
  contactNumber: '',
  email: '', // ✅ ADD THIS
  emergencyContactName: '',
  emergencyContactNumber: '',
  caregiverEmail: "",
  emergencyContactRelation: '',
  address: '',
  knownAllergies: '',
  chronicConditions: '',
  currentMedications: '',
  preferredDoctor: '',
  preferredHospital: '',
  blynkAuthToken: '',
};
const genders = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientRegistration = ({ onRegister }: PatientRegistrationProps) => {
  const [form, setForm] = useState<PatientFormData>(initialForm);
  const [step, setStep] = useState(1);
  const [blynkStatus, setBlynkStatus] = useState<'idle' | 'checking' | 'valid' | 'online' | 'invalid'>('idle');
  const [blynkError, setBlynkError] = useState('');

  const update = (field: keyof PatientFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'blynkAuthToken') {
      setBlynkStatus('idle');
      setBlynkError('');
    }
  };

  const verifyBlynkToken = async () => {
    if (!form.blynkAuthToken.trim()) {
      setBlynkError('Blynk Auth Token is required for live monitoring');
      return;
    }
    setBlynkStatus('checking');
    setBlynkError('');
    const result = await validateBlynkToken(form.blynkAuthToken.trim());
    if (!result.valid) {
      setBlynkStatus('invalid');
      setBlynkError('Invalid token — device not found on Blynk Cloud. Check your token and try again.');
    } else if (result.online) {
      setBlynkStatus('online');
    } else {
      setBlynkStatus('valid');
    }
  };

 const canProceedStep1 =
  form.fullName &&
  form.age &&
  form.gender &&
  form.bloodGroup &&
  form.contactNumber &&
  form.email; // ✅ REQUIRED
  const canProceedStep2 = form.emergencyContactName && form.emergencyContactNumber && form.caregiverEmail && form.emergencyContactRelation;
  const canSubmit = canProceedStep1 && canProceedStep2 && form.blynkAuthToken.trim() && (blynkStatus === 'valid' || blynkStatus === 'online');

  const handleSubmit = () => {
    if (canSubmit) onRegister(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl medical-gradient flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">NeuroTrack</h1>
          <p className="text-muted-foreground text-sm mt-1">Patient Registration — For real-time monitoring & emergency response</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : s < step
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {s === 1 && <><UserPlus className="w-3 h-3" />Personal</>}
              {s === 2 && <><Shield className="w-3 h-3" />Emergency</>}
              {s === 3 && <><Activity className="w-3 h-3" />Medical & Device</>}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-foreground text-lg mb-1">Personal Information</h2>
              <p className="text-xs text-muted-foreground mb-4">Basic details for patient identification and contact.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name *</label>
                  <Input placeholder="Enter full name" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                </div>
                <div>
                  <div>
  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
    Email *
  </label>
  <Input
    type="email"
    placeholder="Enter email"
    value={form.email}
    onChange={e => update('email', e.target.value)}
  />
</div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Age *</label>
                  <Input type="number" placeholder="e.g. 55" value={form.age} onChange={e => update('age', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Gender *</label>
                  <div className="flex gap-2">
                    {genders.map(g => (
                      <button
                        key={g}
                        onClick={() => update('gender', g)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          form.gender === g
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Blood Group *</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {bloodGroups.map(bg => (
                      <button
                        key={bg}
                        onClick={() => update('bloodGroup', bg)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.bloodGroup === bg
                            ? 'bg-destructive text-destructive-foreground border-destructive'
                            : 'bg-card text-muted-foreground border-border hover:border-destructive/40'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Contact Number *</label>
                  <Input type="tel" placeholder="+91-98765-43210" value={form.contactNumber} onChange={e => update('contactNumber', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Address</label>
                  <Input placeholder="City, Area" value={form.address} onChange={e => update('address', e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>Next — Emergency Contact</Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Emergency / Caregiver */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-foreground text-lg mb-1">Emergency & Caregiver Info</h2>
              <p className="text-xs text-muted-foreground mb-4">This person will be contacted via SMS during emergencies or abnormal vitals.</p>

              <div className="rounded-xl px-4 py-3 border flex items-center gap-3 mb-2" style={{ background: 'hsl(var(--vital-warning-bg))', borderColor: 'hsl(var(--vital-warning) / 0.3)' }}>
                <Shield className="w-4 h-4" style={{ color: 'hsl(var(--vital-warning))' }} />
                <span className="text-xs font-medium text-foreground">This contact will receive immediate SMS alerts during critical events like fall detection or abnormal vitals.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Caregiver / Emergency Contact Name *</label>
                  <Input placeholder="e.g. Sunita Mehta" value={form.emergencyContactName} onChange={e => update('emergencyContactName', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Emergency Contact Number *</label>
                  <Input type="tel" placeholder="+91-98765-43210" value={form.emergencyContactNumber} onChange={e => update('emergencyContactNumber', e.target.value)} />
                </div>
                <div className="md:col-span-2">
  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
    Caregiver Email (for Emergency Alerts) *
  </label>
  <Input
    type="email"
    placeholder="Enter caregiver email"
    value={form.caregiverEmail}
    onChange={(e) => update("caregiverEmail", e.target.value)}
  />
</div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Relation to Patient *</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Other'].map(r => (
                      <button
                        key={r}
                        onClick={() => update('emergencyContactRelation', r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.emergencyContactRelation === r
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>Next — Medical Info</Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Medical + Device */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-display font-bold text-foreground text-lg mb-1">Medical & Device Setup</h2>
              <p className="text-xs text-muted-foreground mb-4">Medical history for immediate care. Blynk token is <strong>mandatory</strong> — it connects your ESP32 sensors for live tracking.</p>

              {/* Blynk Token — MANDATORY — shown prominently at top */}
              <div className="rounded-xl border-2 p-4 space-y-3 mb-4" style={{
                borderColor: blynkStatus === 'online' ? 'hsl(var(--vital-normal))' : blynkStatus === 'valid' ? 'hsl(var(--vital-warning))' : blynkStatus === 'invalid' ? 'hsl(var(--vital-abnormal))' : 'hsl(var(--primary) / 0.4)',
                background: blynkStatus === 'online' ? 'hsl(var(--vital-normal-bg))' : blynkStatus === 'valid' ? 'hsl(var(--vital-warning-bg))' : blynkStatus === 'invalid' ? 'hsl(var(--vital-abnormal-bg))' : 'hsl(var(--primary) / 0.05)',
              }}>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <label className="text-sm font-bold text-foreground">Blynk Auth Token *</label>
                  <span className="status-badge-abnormal text-[10px]">Required</span>
                </div>
                <p className="text-xs text-muted-foreground">Paste the Auth Token from your Blynk device. This connects your ESP32 sensors for real-time vital sign tracking. Without this, live monitoring cannot start.</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. A1b2C3d4E5f6G7h8..."
                    value={form.blynkAuthToken}
                    onChange={e => update('blynkAuthToken', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={verifyBlynkToken}
                    disabled={!form.blynkAuthToken.trim() || blynkStatus === 'checking'}
                  >
                    {blynkStatus === 'checking' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    {blynkStatus === 'checking' ? 'Verifying...' : 'Verify Token'}
                  </Button>
                </div>
                {blynkStatus === 'online' && (
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'hsl(var(--vital-normal))' }}>
                    <CheckCircle className="w-4 h-4" />
                    Device verified & online — Live sensor data will stream to your dashboard
                  </div>
                )}
                {blynkStatus === 'valid' && (
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'hsl(var(--vital-warning))' }}>
                    <CheckCircle className="w-4 h-4" />
                    Token valid — Device is currently offline. Data will sync when device connects.
                  </div>
                )}
                {blynkStatus === 'invalid' && (
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'hsl(var(--vital-abnormal))' }}>
                    <XCircle className="w-4 h-4" />
                    {blynkError}
                  </div>
                )}
                {blynkError && blynkStatus === 'idle' && (
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'hsl(var(--vital-abnormal))' }}>
                    <XCircle className="w-4 h-4" />
                    {blynkError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Known Allergies</label>
                  <Input placeholder="e.g. Penicillin, Shellfish" value={form.knownAllergies} onChange={e => update('knownAllergies', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Chronic Conditions</label>
                  <Input placeholder="e.g. Diabetes, Hypertension" value={form.chronicConditions} onChange={e => update('chronicConditions', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Current Medications</label>
                  <Input placeholder="e.g. Metformin 500mg, Lisinopril 10mg" value={form.currentMedications} onChange={e => update('currentMedications', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Preferred Doctor</label>
                  <Input placeholder="e.g. Dr. Sarah Patel" value={form.preferredDoctor} onChange={e => update('preferredDoctor', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Preferred Hospital</label>
                  <Input placeholder="e.g. Apollo Hospital, Chennai" value={form.preferredHospital} onChange={e => update('preferredHospital', e.target.value)} />
                </div>
              </div>

             <div className="flex justify-between pt-4">
  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>

  <Button
    type="button"   // ✅ ADD THIS
    onClick={handleSubmit}
    disabled={!canSubmit}
    className="medical-gradient border-0 text-primary-foreground"
  >
    <UserPlus className="w-4 h-4 mr-1" />
    Register & Start Monitoring
  </Button>
</div>
            </motion.div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Your data is encrypted and stored securely. Only authorized medical staff can access your records.
        </p>
      </motion.div>
    </div>
  );
};

export default PatientRegistration;
