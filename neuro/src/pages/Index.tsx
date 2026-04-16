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
import OTPVerification from "../components/OTPVerification"; // ✅ NEW
import { getOverallStatus,type VitalSign,getFirstAidSuggestions } from '../lib/vitals';
import { fetchBlynkVitals } from '../lib/blynk';
import { Wifi, WifiOff, Bell, LogOut } from 'lucide-react';

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

  // ✅ OTP STATES
  const [isOtpStep, setIsOtpStep] = useState(false);

  const [activeSection, setActiveSection] = useState('data');
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [fallDetected, setFallDetected] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ✅ REGISTER FUNCTION (SEND TO OTP STEP)
  const handleRegister = (data: PatientProfile) => {
    localStorage.setItem('temp_patient', JSON.stringify(data));
    localStorage.setItem('phone', "+91" + data.contactNumber);

    setIsOtpStep(true);
    setIsRegistered(false);
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
    if (role === 'doctor') setActiveSection('lookup');
  };

  useEffect(() => {
    if (!isRegistered || !patient?.blynkAuthToken) return;

    const fetchData = async () => {
      const result = await fetchBlynkVitals(patient.blynkAuthToken.trim());
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

  // ✅ ROLE SELECT
  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button onClick={() => handleRoleSelect('patient')}>Patient</button>
        <button onClick={() => handleRoleSelect('doctor')}>Doctor</button>
      </div>
    );
  }

  // ✅ SHOW REGISTRATION
  if (userRole === 'patient' && !isRegistered && !isOtpStep) {
    return <PatientRegistration onRegister={handleRegister} />;
  }

  // ✅ SHOW OTP SCREEN
  if (userRole === 'patient' && isOtpStep) {
    return (
      <OTPVerification
        phone={localStorage.getItem("phone")}
        onVerify={() => {
          const saved = localStorage.getItem('temp_patient');
          if (saved) {
            localStorage.setItem('neurotrack_patient', saved);
            setPatient(JSON.parse(saved));
          }
          setIsRegistered(true);
          setIsOtpStep(false);
        }}
      />
    );
  }

  const overallStatus = getOverallStatus(vitals);
  const firstAid = getFirstAidSuggestions(vitals);

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={userRole || 'patient'} />
      <main className="flex-1">
        <div className="p-6">
          <StatusBanner status={overallStatus} firstAidSuggestions={firstAid} />
          <ECGChart />
        </div>
      </main>
    </div>
  );
};

export default Index;