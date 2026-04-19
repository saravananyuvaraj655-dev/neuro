import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { User, Wifi, WifiOff, Bell, LogOut, Heart, Stethoscope, Activity } from 'lucide-react';
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
import { getAmbulanceAlert, getEmergencyAlert, handleEmergency, type AmbulanceAlert, type EmergencyAlert } from '../lib/emergecyController';

// ---------- Welcome screen ----------
const WelcomeScreen = ({
  
  onSelectRole,
}: {
  onSelectRole: (role: 'patient' | 'doctor', mode: 'login' | 'signup') => void;
}) => (
  
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
        <h1 className="font-display text-3xl font-bold text-foreground">Welcome to NeuroTrack</h1>
        <p className="text-muted-foreground mt-2">Real-Time Neuro-Vitals Monitoring & Hospital Coordination</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([
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
        ] as const).map(({ role, icon: Icon, label, desc }) => (
          <div
            key={role}
            className="rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <span className="font-display font-bold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
            <div className="flex gap-2 w-full pt-2">
              <button
                onClick={() => onSelectRole(role, 'login')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Login
              </button>
              <button
                onClick={() => onSelectRole(role, 'signup')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border text-foreground hover:border-primary transition-colors"
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

// ---------- Types ----------
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
}

// ---------- Main component ----------
const Index = () => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(() => {
    const role = localStorage.getItem('neurotrack_role') as 'patient' | 'doctor' | null;
    const authed = localStorage.getItem('neurotrack_authed_phone') || localStorage.getItem('neurotrack_authed_email');
    return role && authed ? role : null;
  });

  const [isRegistered, setIsRegistered] = useState(() => !!localStorage.getItem('neurotrack_patient'));
 const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
 const [menuOpen, setMenuOpen] = useState(false);
  const [patient, setPatient] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('neurotrack_patient');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSection, setActiveSection] = useState('data');
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [fallDetected, setFallDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Emergency / ambulance UI state (read from localStorage)
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);
  const [ambulanceAlert, setAmbulanceAlert] = useState<AmbulanceAlert | null>(null);

  // Prevent duplicate handleEmergency calls within the same render cycle
  const emergencyFiredRef = useRef(false);

  // ---------- Registration handlers ----------
  const handleRegister = (data: PatientProfile) => {
    localStorage.setItem('neurotrack_patient', JSON.stringify(data));
    setPatient(data);
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('neurotrack_patient');
    localStorage.removeItem('neurotrack_role');
    localStorage.removeItem('neurotrack_authed_phone');
    localStorage.removeItem('neurotrack_authed_email');
    setPatient(null);
    setIsRegistered(false);
    setUserRole(null);
  };

 const handleRoleSelect = (role: 'patient' | 'doctor', mode: 'login' | 'signup') => {
  localStorage.setItem('neurotrack_role', role);

  if (mode === 'login') {
    if (role === 'patient') {
      navigate('/patient-login'); // ✅ patient route
    } else {
      navigate('/login'); // ✅ doctor route
    }
  } else {
    if (role === 'doctor') {
      navigate('/doctor-signup');
    } else {
      setUserRole(role);
    }
  }
};

  // ---------- Blynk live data ----------
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

useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    console.log("✅ Install prompt ready");
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);

  const overallStatus = getOverallStatus(vitals);
  const emergencyWithFall = fallDetected ? ('emergency' as const) : overallStatus;


  const handleInstallClick = async () => {
  if (deferredPrompt) {
    // ✅ Real install flow
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("✅ App installed");
    } else {
      console.log("❌ Install dismissed");
    }

    setDeferredPrompt(null);
  } else {
    // ⚠️ Fallback (when install not available)
    alert(
      "To install:\n\n👉 Chrome: Click ⋮ menu → 'Install App'\n👉 Mobile: 'Add to Home Screen'"
    );
  }
};

  useEffect(() => {
    if (emergencyWithFall === 'emergency') {
      if (!emergencyFiredRef.current) {
        emergencyFiredRef.current = true;
        handleEmergency().then(() => {
          // Refresh UI banners from localStorage after trigger
          setEmergencyAlert(getEmergencyAlert());
          setAmbulanceAlert(getAmbulanceAlert());
          // Reset flag after cooldown so next emergency can fire again
          setTimeout(() => {
            emergencyFiredRef.current = false;
          }, 60_000);
        });
      }
    } else {
      // Status recovered — allow next emergency to fire
      emergencyFiredRef.current = false;
    }
  }, [emergencyWithFall]);

  // Also load any persisted alerts on mount (e.g., page refresh during emergency)
  useEffect(() => {
    setEmergencyAlert(getEmergencyAlert());
    setAmbulanceAlert(getAmbulanceAlert());
  }, []);

  // ---------- Derived data ----------
  const firstAid = getFirstAidSuggestions(vitals);
  const patientId = `P-${Math.abs((patient?.fullName ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 1001) % 9000 + 1000}`;
  const isDoctorView = userRole === 'doctor';

  // ---------- Content renderer ----------
  const renderContent = () => {
    switch (activeSection) {
      case 'data':
        return (
          <div className="space-y-6">
            {/* ── Emergency alert banner (doctor dashboard) ── */}
            {isDoctorView && emergencyAlert?.triggered && (
              <div className="rounded-xl px-5 py-4 flex items-center gap-3 border border-red-400 bg-red-50 dark:bg-red-950/30">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="font-bold text-red-700 dark:text-red-400 text-sm">
                    Emergency detected — {emergencyAlert.patientName}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                    Detected at {emergencyAlert.time}
                  </p>
                </div>
              </div>
            )}

            {/* ── Ambulance dispatch banner ── */}
            {ambulanceAlert?.status === 'Dispatched' && (
              <div className="rounded-xl px-5 py-4 flex items-center gap-3 border border-blue-400 bg-blue-50 dark:bg-blue-950/30">
                <span className="text-xl">🚑</span>
                <div>
                  <p className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                    Ambulance dispatched
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                    Dispatched at {ambulanceAlert.time}
                  </p>
                </div>
              </div>
            )}

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
                  <span className="text-destructive font-medium">⚠️ Allergies: {patient.knownAllergies}</span>
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

  // ---------- Guards ----------
  if (!userRole)
  return (
    <div className="flex flex-col min-h-screen">
  <div className="flex-1">
    <WelcomeScreen onSelectRole={handleRoleSelect} />
  </div>

  {/* ✅ Sticky install button (no overlap) */}
  <div className="bg-background border-t p-4">
    <button
      onClick={handleInstallClick}
      className="w-full bg-primary text-white py-3 rounded-xl shadow hover:scale-[1.02] transition-transform"
    >
      📲 Install NeuroTrack App
    </button>
  </div>
</div>
  );
  if (userRole === 'patient' && !isRegistered) return <PatientRegistration onRegister={handleRegister} />;

  // ---------- Main layout ----------
  return (
    <div className="flex min-h-screen w-full">

  {/* ✅ Sidebar hidden on mobile */}
  <div className="hidden md:block">
    <AppSidebar
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      userRole={userRole}
    />
  </div>

  {/* ✅ Main Content */}
  <main className="flex-1 w-full min-h-screen overflow-auto">

    {/* Header */}
  <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-2">

    {/* 📱 Mobile Menu Button */}
    <button
      className="md:hidden p-2 rounded-lg hover:bg-muted"
      onClick={() => setMenuOpen(true)}
    >
      ☰
    </button>

    {/* Title */}
    <div>
      <h1 className="font-display text-lg md:text-xl font-bold text-foreground">
        {sectionTitles[activeSection]}
      </h1>

      {isDoctorView ? (
        <p className="text-xs text-muted-foreground">
          Doctor Panel · {new Date().toLocaleDateString()}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Patient: {patient?.fullName} ({patientId})
        </p>
      )}
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-3 md:gap-4">

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

    <button className="p-2 rounded-lg hover:bg-muted">
      <Bell className="w-4 h-4 text-muted-foreground" />
    </button>

    <button
      onClick={handleLogout}
      className="p-2 rounded-lg hover:bg-muted"
    >
      <LogOut className="w-4 h-4 text-muted-foreground" />
    </button>

    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
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
{menuOpen && (
  <div
  className="fixed inset-0 z-50 bg-black/50"
  onClick={() => setMenuOpen(false)}
>
    {/* Sidebar Drawer */}
   <div
  className="w-64 h-full bg-white p-4 shadow-lg"
  onClick={(e) => e.stopPropagation()}
>

      {/* Close Button */}
      <button
        onClick={() => setMenuOpen(false)}
        className="mb-4 text-sm"
      >
        ❌ Close
      </button>

      {/* Sidebar Content */}
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          setMenuOpen(false);
        }}
        userRole={userRole}
      />

    </div>

  </div>
)}
    {/* ✅ Responsive Content */}
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      {renderContent()}
    </div>

  </main>
</div>
  );
};

export default Index;