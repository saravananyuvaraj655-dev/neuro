import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wifi, WifiOff, Bell, LogOut, Heart, Stethoscope, Activity, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBanner from '../components/StatusBanner';
import VitalCard from '../components/VitalCard';
import FallDetection from '../components/FallDetection';
import ECGChart from '../components/ECGChart';
import AppSidebar from '../components/AppSidebar';
import MedicationSection from '../components/MedicationSection';
import HistorySection from '../components/HistorySection';
import AppointmentSection from '../components/AppointmentSection';
import MedicalRecordsSection from '../components/MedicalRecordsSection';
import PatientLookup from '../components/PatientLookup';
import HospitalEmergencies from '../components/HospitalEmergencies';
import AmbulanceSection from '../components/AmbulanceSection';
import PatientRegistration from '../components/PatientRegistration';
import HospitalAppointments from '../components/HospitalAppointments';
import { fetchBlynkVitals } from '../lib/blynk';
import { getFirstAidSuggestions, getOverallStatus, type VitalSign } from '../lib/vitals';
import { usePWAInstall } from '../hooks/usePWAInstall';

// ─── Welcome / role picker shown to unauthenticated users ─────────────────────
const WelcomeScreen = ({
  onSelectRole,
}: {
  onSelectRole: (role: 'patient' | 'doctor', mode: 'login' | 'signup') => void;
}) => {
  const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome to NeuroTrack
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-Time Neuro-Vitals Monitoring & Hospital Coordination
          </p>
        </div>

        {/* 🔥 INSTALL BUTTON ADDED HERE */}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
          >
          Install App
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              role: 'patient' as const,
              icon: Activity,
              label: 'Patient',
              desc: 'Monitor vitals, manage medications & appointments',
            },
            {
              role: 'doctor' as const,
              icon: Stethoscope,
              label: 'Doctor',
              desc: 'Look up patients, manage emergencies & ambulances',
            },
          ].map(({ role, icon: Icon, label, desc }) => (
            <div
              key={role}
              className="rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-primary" />
              </div>

              <span className="font-display font-bold text-foreground">
                {label}
              </span>

              <span className="text-xs text-muted-foreground">{desc}</span>

              <div className="flex gap-2 w-full pt-2">
                <button
                  onClick={() => onSelectRole(role, 'login')}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
                >
                  Login
                </button>

                <button
                  onClick={() => onSelectRole(role, 'signup')}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
// ─── Patient profile type ──────────────────────────────────────────────────────
interface PatientProfile {
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  contactNumber: string;
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
  email?: string;
}

// ─── Main component ────────────────────────────────────────────────────────────
const Index = () => {
  const navigate = useNavigate();
  const { isInstallable, promptInstall } = usePWAInstall();

  // ── Auth state ───────────────────────────────────────────────────────────────
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(() => {
    const role = localStorage.getItem('neurotrack_role') as 'patient' | 'doctor' | null;
    const authed = localStorage.getItem('neurotrack_authed_user');
    return role && authed ? role : null;
  });

  const [isRegistered, setIsRegistered] = useState(() => {
    return !!localStorage.getItem('neurotrack_patient');
  });

  const [patient, setPatient] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('neurotrack_patient');
    return saved ? (JSON.parse(saved) as PatientProfile) : null;
  });

  // ── Vitals state ─────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('data');
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [fallDetected, setFallDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleRegister = (data: PatientProfile) => {
    localStorage.setItem('neurotrack_patient', JSON.stringify(data));
    setPatient(data);
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('neurotrack_patient');
    localStorage.removeItem('neurotrack_role');
    localStorage.removeItem('neurotrack_authed_user');
    setPatient(null);
    setIsRegistered(false);
    setUserRole(null);
  };

  const handleRoleSelect = (role: 'patient' | 'doctor', mode: 'login' | 'signup') => {
    localStorage.setItem('neurotrack_role', role);
    if (mode === 'login') {
      navigate('/login');
    } else {
      // signup
      if (role === 'doctor') {
        navigate('/doctor-signup');
      } else {
        navigate('/signup');
      }
    }
  };

  // ── Live Blynk data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRegistered || !patient?.blynkAuthToken) return;
    const token = patient.blynkAuthToken.trim();

    const fetchData = async () => {
      const result = await fetchBlynkVitals(token);
      if (result) {
        setVitals(result.vitals);
        setFallDetected(result.fallDetected);
        setIsConnected(result.isOnline);
        setLastUpdated(new Date());
      } else {
        setIsConnected(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [isRegistered, patient?.blynkAuthToken]);

  // ── Guard: show welcome if not authed ────────────────────────────────────────
  if (!userRole) {
    return <WelcomeScreen onSelectRole={handleRoleSelect} />;
  }

  // ── Guard: patient profile required ──────────────────────────────────────────
  if (userRole === 'patient' && !isRegistered) {
    return <PatientRegistration onRegister={handleRegister} />;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  const overallStatus = getOverallStatus(vitals);
  const firstAid = getFirstAidSuggestions(vitals);
  const emergencyWithFall = fallDetected ? ('emergency' as const) : overallStatus;

  const patientId = patient
    ? `P-${(Math.abs(
        patient.fullName.split('').reduce((a, c) => a + c.charCodeAt(0), 0),
      ) % 9000) + 1000}`
    : 'P-0000';

  const isDoctorView = userRole === 'doctor';

  const renderContent = () => {
    switch (activeSection) {
      case 'data':
        return (
          <div className="space-y-6">
            <StatusBanner status={emergencyWithFall} firstAidSuggestions={firstAid} />
            {/* Quick patient info strip */}
            <div
              className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-4 text-xs"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <span className="font-semibold text-foreground">🩸 {patient?.bloodGroup}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                Age {patient?.age} · {patient?.gender}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                📞 Emergency: {patient?.emergencyContactName} ({patient?.emergencyContactRelation}) —{' '}
                {patient?.emergencyContactNumber}
              </span>
              {patient?.knownAllergies && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-destructive font-medium">
                    ⚠️ Allergies: {patient.knownAllergies}
                  </span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {vitals.map((v, i) => (
                <VitalCard key={v.id} vital={v} index={i} />
              ))}
              <FallDetection fallDetected={fallDetected} />
            </div>
            <ECGChart />
          </div>
        );
      case 'medication':
        return <MedicationSection />;
      case 'history':
        return <HistorySection />;
      case 'appointments':
        return <AppointmentSection />;
      case 'records':
        return <MedicalRecordsSection />;
      case 'lookup':
        return <PatientLookup />;
      case 'emergencies':
        return <HospitalEmergencies />;
      case 'ambulance':
        return <AmbulanceSection />;
      case 'hospital-appointments':
        return <HospitalAppointments />;
      default:
        return null;
    }
  };

  const sectionTitles: Record<string, string> = {
    data: 'Real-Time Vitals',
    medication: 'Medication Reminders',
    history: 'Medical History',
    appointments: 'Appointments',
    records: 'Medical Records',
    lookup: 'Patient Lookup',
    emergencies: 'Emergencies',
    ambulance: 'Ambulance',
    'hospital-appointments': 'Hospital Appointments',
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userRole ?? 'patient'}
      />
      <main className="flex-1 min-h-screen overflow-auto">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {sectionTitles[activeSection]}
            </h1>
            {isDoctorView ? (
              <p className="text-xs text-muted-foreground">
                Doctor Panel · {new Date().toLocaleDateString()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Patient: {patient?.fullName} ({patientId}) · Last update:{' '}
                {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* PWA Install button — only shows when installable */}
            {isInstallable && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={promptInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                title="Install NeuroTrack app"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </motion.button>
            )}

            {/* Connection indicator (patient only) */}
            {!isDoctorView && (
              <div className="flex items-center gap-1.5 text-xs">
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-vital-normal" />
                    <span className="text-muted-foreground">
                      {patient?.blynkAuthToken ? 'Blynk Connected' : 'Simulated'}
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-vital-abnormal" />
                    <span className="text-destructive">Offline</span>
                  </>
                )}
              </div>
            )}

            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {!isDoctorView && emergencyWithFall !== 'normal' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-display font-bold text-primary">
              {isDoctorView
                ? 'Dr'
                : patient?.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Index;