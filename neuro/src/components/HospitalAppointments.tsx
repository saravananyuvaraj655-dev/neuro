import { CalendarCheck, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

const todayAppts = [
  { id: '1', patient: 'Arjun Mehta (P-1001)', doctor: 'Dr. Patel', time: '10:00 AM' },
  { id: '2', patient: 'Sunita Rao (P-1070)', doctor: 'Dr. Kumar', time: '11:30 AM' },
  { id: '3', patient: 'Amit Deshmukh (P-1023)', doctor: 'Dr. Sharma', time: '2:00 PM' },
];

const initialRequests = [
  { id: 'r1', patient: 'Priya Iyer (P-1055)', reason: 'Follow-up — neurological assessment', status: 'pending' },
  { id: 'r2', patient: 'Rajesh Verma (P-1042)', reason: 'Emergency consultation — cardiac review', status: 'pending' },
];

const HospitalAppointments = () => {
  const [requests, setRequests] = useState(initialRequests);

  const handleRequest = (id: string, action: 'accepted' | 'denied') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <CalendarCheck className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Hospital Appointments</h2>
      </div>

      <div>
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Today's Schedule</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Patient</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Doctor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {todayAppts.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{a.patient}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.doctor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Appointment Requests</h3>
        <div className="grid gap-3">
          {requests.map(r => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div>
                <p className="font-semibold text-foreground text-sm">{r.patient}</p>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
              </div>
              {r.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRequest(r.id, 'accepted')}><Check className="w-3 h-3 mr-1" />Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRequest(r.id, 'denied')}><X className="w-3 h-3 mr-1" />Deny</Button>
                </div>
              ) : (
                <span className={r.status === 'accepted' ? 'status-badge-normal' : 'status-badge-abnormal'}>{r.status}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalAppointments;
