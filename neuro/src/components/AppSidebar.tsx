import { Activity, Pill, History, CalendarDays, FolderOpen, Search, AlertTriangle, Truck, CalendarCheck, Heart } from 'lucide-react';

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: 'patient' | 'doctor';
}

const patientSections = [
  { id: 'data', label: 'Live Vitals', icon: Activity },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'history', label: 'History', icon: History },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'records', label: 'Medical Records', icon: FolderOpen },
];

const hospitalSections = [
  { id: 'lookup', label: 'Patient Lookup', icon: Search },
  { id: 'emergencies', label: 'Emergencies', icon: AlertTriangle },
  { id: 'ambulance', label: 'Ambulance', icon: Truck },
  { id: 'hospital-appointments', label: 'Appointments', icon: CalendarCheck },
];

const AppSidebar = ({ activeSection, onSectionChange, userRole }: AppSidebarProps) => {
  return (
    <aside className="sidebar-nav w-64 min-h-screen flex flex-col py-6 shrink-0">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-primary-foreground">NeuroTrack</h1>
          <p className="text-xs opacity-60">{userRole === 'doctor' ? 'Doctor Panel' : 'Vitals Monitor'}</p>
        </div>
      </div>

      {userRole === 'patient' && (
        <>
          <div className="px-4 mb-2">
            <span className="text-[10px] uppercase tracking-wider opacity-40 px-2 font-semibold">Patient Dashboard</span>
          </div>
          {patientSections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`sidebar-item mx-3 ${activeSection === s.id ? 'sidebar-item-active' : ''}`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </>
      )}

      {userRole === 'doctor' && (
        <>
          <div className="px-4 mb-2">
            <span className="text-[10px] uppercase tracking-wider opacity-40 px-2 font-semibold">Hospital Dashboard</span>
          </div>
          {hospitalSections.map((s) => (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`sidebar-item mx-3 ${activeSection === s.id ? 'sidebar-item-active' : ''}`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </>
      )}
    </aside>
  );
};

export default AppSidebar;
