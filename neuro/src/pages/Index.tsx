import { useState, useEffect } from 'react';
import AppSidebar from '../components/AppSidebar';
import ECGChart from '../components/ECGChart';
import VitalCard from '../components/VitalCard';
import StatusBanner from '../components/StatusBanner';
import FallDetection from '../components/FallDetection';
import MedicationSection from '../components/MedicationSection';
import HistorySection from '../components/HistorySection';
import AppointmentSection from '../components/AppointmentSection';
import MedicalRecordsSection from '../components/MedicalRecordsSection';
import PatientLookup from '../components/PatientLookup';
import HospitalEmergencies from '../components/HospitalEmergencies';
import AmbulanceSection from '../components/AmbulanceSection';
import HospitalAppointments from '../components/HospitalAppointments';
import PatientRegistration from '../components/PatientRegistration';
import { getOverallStatus, getFirstAidSuggestions, type VitalSign } from '@/lib/vitals';
import { fetchBlynkVitals } from '@/lib/blynk';
import { User, Wifi, WifiOff, Bell, LogOut, Heart, Stethoscope, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const WelcomeScreen = ({ onSelectRole }: { onSelectRole: (role: 'patient' | 'doctor') => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg w-full text-center space-y-8"
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
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectRole('patient')}
          className="rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center gap-3 hover:border-primary transition-colors cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-7 h-7 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground">Patient</span>
          <span className="text-xs text-muted-foreground">Monitor vitals, manage medications & appointments</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectRole('doctor')}
          className="rounded-xl border-2 border-border bg-card p-6 flex flex-col items-center gap-3 hover:border-primary transition-colors cursor-pointer"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground">Doctor</span>
          <span className="text-xs text-muted-foreground">Look up patients, manage emergencies & ambulances</span>
        </motion.button>
      </div>
    </motion.div>
  </div>
);

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

const Index = () => {
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(() => {
    return localStorage.getItem('neurotrack_role') as 'patient' | 'doctor' | null;
  });
  const [isRegistered, setIsRegistered] = useState(() => {
    return !!localStorage.getItem('neurotrack_patient');
  });
  const [patient, setPatient] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('neurotrack_patient');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSection, setActiveSection] = useState('data');
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [fallDetected, setFallDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRegister = (data: PatientProfile) => {
    localStorage.setItem('neurotrack_patient', JSON.stringify(data));
    setPatient(data);
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('neurotrack_patient');
    localStorage.removeItem('neurotrack_role');
    setPatient(null);
    setIsRegistered(false);
    setUserRole(null);
  };

  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    localStorage.setItem('neurotrack_role', role);
    setUserRole(role);
    if (role === 'doctor') {
      setActiveSection('lookup');
    }
  };

  // Fetch LIVE data from Blynk Cloud every 3 seconds
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

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [isRegistered, patient?.blynkAuthToken]);

  if (!userRole) {
    return <WelcomeScreen onSelectRole={handleRoleSelect} />;
  }

  if (userRole === 'patient' && !isRegistered) {
    return <PatientRegistration onRegister={handleRegister} />;
  }


  const overallStatus = getOverallStatus(vitals);
  const firstAid = getFirstAidSuggestions(vitals);
  const emergencyWithFall = fallDetected ? 'emergency' as const : overallStatus;
  const patientId = `P-${Math.abs(patient?.fullName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 1001) % 9000 + 1000}`;

  const renderContent = () => {
    switch (activeSection) {
      case 'data':
        return (
          <div className="space-y-6">
            <StatusBanner status={emergencyWithFall} firstAidSuggestions={firstAid} />
            {/* Quick patient info strip */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap items-center gap-4 text-xs" style={{ boxShadow: 'var(--shadow-card)' }}>
              <span className="font-semibold text-foreground">🩸 {patient?.bloodGroup}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Age {patient?.age} · {patient?.gender}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">📞 Emergency: {patient?.emergencyContactName} ({patient?.emergencyContactRelation}) — {patient?.emergencyContactNumber}</span>
              {patient?.knownAllergies && <>
                <span className="text-muted-foreground">|</span>
                <span className="text-destructive font-medium">⚠️ Allergies: {patient.knownAllergies}</span>
              </>}
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
      case 'medication': return <MedicationSection />;
      case 'history': return <HistorySection />;
      case 'appointments': return <AppointmentSection />;
      case 'records': return <MedicalRecordsSection />;
      case 'lookup': return <PatientLookup />;
      case 'emergencies': return <HospitalEmergencies />;
      case 'ambulance': return <AmbulanceSection />;
      case 'hospital-appointments': return <HospitalAppointments />;
      default: return null;
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

  const isDoctorView = userRole === 'doctor';

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={userRole || 'patient'} />
      <main className="flex-1 min-h-screen overflow-auto">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{sectionTitles[activeSection]}</h1>
            {isDoctorView ? (
              <p className="text-xs text-muted-foreground">Doctor Panel · {new Date().toLocaleDateString()}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Patient: {patient?.fullName} ({patientId}) · Last update: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isDoctorView && (
              <div className="flex items-center gap-1.5 text-xs">
                {isConnected ? (
                  <><Wifi className="w-3.5 h-3.5 text-vital-normal" /><span className="text-muted-foreground">{patient?.blynkAuthToken ? 'Blynk Connected' : 'Simulated'}</span></>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5 text-vital-abnormal" /><span className="text-destructive">Offline</span></>
                )}
              </div>
            )}
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {!isDoctorView && emergencyWithFall !== 'normal' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
              )}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Logout">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-display font-bold text-primary">
              {isDoctorView ? 'Dr' : patient?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </header>
        <div className="p-6 max-w-6xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
