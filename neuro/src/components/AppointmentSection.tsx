import { useState } from 'react';
import { CalendarDays, Plus, X, Clock, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { Appointment } from '../lib/vitals';

const initialAppointments: Appointment[] = [
  { id: '1', doctorName: 'Dr. Sarah Patel', specialty: 'Neurologist', date: '2026-04-05', time: '10:00 AM', status: 'scheduled' },
  { id: '2', doctorName: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', date: '2026-04-08', time: '2:30 PM', status: 'pending' },
  { id: '3', doctorName: 'Dr. Ananya Sharma', specialty: 'General Physician', date: '2026-03-28', time: '9:00 AM', status: 'completed' },
  { id: '4', doctorName: 'Dr. Michael Chen', specialty: 'Endocrinologist', date: '2026-03-15', time: '11:30 AM', status: 'completed' },
];

const AppointmentSection = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestDoctor, setRequestDoctor] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const cancel = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));

  const submitRequest = () => {
    if (!requestDoctor.trim() || !requestDate.trim()) return;
    const newAppt: Appointment = {
      id: Date.now().toString(),
      doctorName: requestDoctor,
      specialty: requestReason || 'General Consultation',
      date: requestDate,
      time: 'TBD',
      status: 'pending',
    };
    setAppointments(prev => [newAppt, ...prev]);
    setRequestDoctor('');
    setRequestDate('');
    setRequestReason('');
    setShowRequestForm(false);
  };

  const statusConfig: Record<string, { badge: string; label: string }> = {
    scheduled: { badge: 'status-badge-normal', label: 'Confirmed' },
    completed: { badge: 'status-badge-normal', label: 'Completed' },
    cancelled: { badge: 'status-badge-abnormal', label: 'Cancelled' },
    pending: { badge: 'status-badge-warning', label: 'Pending Approval' },
  };

  const upcoming = appointments.filter(a => a.status === 'scheduled' || a.status === 'pending');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">My Appointments</h2>
        </div>
        <Button size="sm" onClick={() => setShowRequestForm(!showRequestForm)}>
          <Plus className="w-3 h-3 mr-1" />Request Appointment
        </Button>
      </div>

      {/* Request Form */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3 overflow-hidden"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Request New Appointment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Doctor Name</label>
                <Input placeholder="e.g. Dr. Sarah Patel" value={requestDoctor} onChange={e => setRequestDoctor(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Preferred Date</label>
                <Input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason / Specialty</label>
                <Input placeholder="e.g. Follow-up checkup" value={requestReason} onChange={e => setRequestReason(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={submitRequest}><Send className="w-3 h-3 mr-1" />Submit Request</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowRequestForm(false)}>Cancel</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Your request will be sent to the hospital. You'll be notified once it's approved.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming / Pending */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Upcoming & Pending</h3>
          <div className="grid gap-3">
            {upcoming.map((apt) => {
              const config = statusConfig[apt.status];
              return (
                <div key={apt.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                      {apt.doctorName.split(' ').slice(1).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{apt.date}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />{apt.time}
                      </p>
                    </div>
                    <span className={config.badge}>{config.label}</span>
                    {apt.status === 'scheduled' && (
                      <Button variant="ghost" size="sm" onClick={() => cancel(apt.id)} title="Cancel appointment">
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Past Appointments</h3>
          <div className="grid gap-3">
            {past.map((apt) => {
              const config = statusConfig[apt.status];
              return (
                <div key={apt.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between opacity-70" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-display font-bold text-sm">
                      {apt.doctorName.split(' ').slice(1).map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{apt.date}</p>
                      <p className="text-xs text-muted-foreground">{apt.time}</p>
                    </div>
                    <span className={config.badge}>{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentSection;
