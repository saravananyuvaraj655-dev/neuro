import { useState, useEffect } from 'react';
import { Check, Clock, Pill, Bell, BellRing, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  scheduledHour: number;
  scheduledMinute: number;
  beforeAfterFood: 'Before' | 'After';
  taken: boolean;
  takenAt?: string;
}

const initialMeds: Medication[] = [
  { id: '1', name: 'Metformin', dosage: '500mg', scheduledTime: '8:00 AM', scheduledHour: 8, scheduledMinute: 0, beforeAfterFood: 'After', taken: false },
  { id: '2', name: 'Lisinopril', dosage: '10mg', scheduledTime: '8:00 AM', scheduledHour: 8, scheduledMinute: 0, beforeAfterFood: 'Before', taken: false },
  { id: '3', name: 'Aspirin', dosage: '75mg', scheduledTime: '1:00 PM', scheduledHour: 13, scheduledMinute: 0, beforeAfterFood: 'After', taken: false },
  { id: '4', name: 'Atorvastatin', dosage: '20mg', scheduledTime: '9:00 PM', scheduledHour: 21, scheduledMinute: 0, beforeAfterFood: 'After', taken: false },
  { id: '5', name: 'Vitamin D3', dosage: '1000 IU', scheduledTime: '9:00 PM', scheduledHour: 21, scheduledMinute: 0, beforeAfterFood: 'After', taken: false },
];

type ReminderStatus = 'upcoming' | 'due' | 'overdue' | 'taken';

function getReminderStatus(med: Medication, now: Date): ReminderStatus {
  if (med.taken) return 'taken';
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const medMinutes = med.scheduledHour * 60 + med.scheduledMinute;
  const diff = medMinutes - nowMinutes;
  if (diff > 30) return 'upcoming';
  if (diff >= -15) return 'due';
  return 'overdue';
}

const statusConfig: Record<ReminderStatus, { label: string; badge: string; icon: React.ReactNode; cardClass: string }> = {
  upcoming: {
    label: 'Upcoming',
    badge: 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground',
    icon: <Clock className="w-4 h-4 text-muted-foreground" />,
    cardClass: 'border-border bg-card',
  },
  due: {
    label: '⏰ Time to take!',
    badge: 'status-badge-warning',
    icon: <BellRing className="w-4 h-4" style={{ color: 'hsl(var(--vital-warning))' }} />,
    cardClass: 'vital-warning',
  },
  overdue: {
    label: '⚠️ Overdue!',
    badge: 'status-badge-abnormal',
    icon: <AlertCircle className="w-4 h-4" style={{ color: 'hsl(var(--vital-abnormal))' }} />,
    cardClass: 'vital-abnormal',
  },
  taken: {
    label: '✅ Taken',
    badge: 'status-badge-normal',
    icon: <Check className="w-4 h-4" style={{ color: 'hsl(var(--vital-normal))' }} />,
    cardClass: 'vital-normal',
  },
};

const MedicationSection = () => {
  const [meds, setMeds] = useState<Medication[]>(initialMeds);
  const [now, setNow] = useState(new Date());

  // Update time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const markTaken = (id: string) => {
    setMeds(prev => prev.map(m =>
      m.id === id ? { ...m, taken: true, takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
    ));
  };

  // Sort: due first, then overdue, then upcoming, then taken
  const priorityOrder: Record<ReminderStatus, number> = { due: 0, overdue: 1, upcoming: 2, taken: 3 };
  const sortedMeds = [...meds].sort((a, b) => {
    const sa = getReminderStatus(a, now);
    const sb = getReminderStatus(b, now);
    return priorityOrder[sa] - priorityOrder[sb];
  });

  const dueCount = meds.filter(m => getReminderStatus(m, now) === 'due').length;
  const overdueCount = meds.filter(m => getReminderStatus(m, now) === 'overdue').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Medication Reminders</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Alert banner when meds are due */}
      <AnimatePresence>
        {(dueCount > 0 || overdueCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl px-5 py-3 flex items-center gap-3 border"
            style={{
              background: overdueCount > 0 ? 'hsl(var(--vital-abnormal-bg))' : 'hsl(var(--vital-warning-bg))',
              borderColor: overdueCount > 0 ? 'hsl(var(--vital-abnormal) / 0.3)' : 'hsl(var(--vital-warning) / 0.3)',
            }}
          >
            <BellRing className="w-5 h-5" style={{ color: overdueCount > 0 ? 'hsl(var(--vital-abnormal))' : 'hsl(var(--vital-warning))' }} />
            <span className="font-semibold text-sm text-foreground">
              {overdueCount > 0
                ? `${overdueCount} medication${overdueCount > 1 ? 's' : ''} overdue! Please take immediately.`
                : `${dueCount} medication${dueCount > 1 ? 's' : ''} due now — Time to take your medicine!`
              }
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medication cards */}
      <div className="grid gap-3">
        {sortedMeds.map((med, index) => {
          const status = getReminderStatus(med, now);
          const config = statusConfig[status];

          return (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border p-4 flex items-center justify-between transition-all duration-300 ${config.cardClass}`}
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center">
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{med.name}</p>
                    <span className="text-xs text-muted-foreground">{med.dosage}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{med.scheduledTime}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {med.beforeAfterFood} food
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={config.badge}>{config.label}</span>
                {med.taken && med.takenAt && (
                  <span className="text-[10px] text-muted-foreground">at {med.takenAt}</span>
                )}
                {!med.taken && (status === 'due' || status === 'overdue') && (
                  <Button size="sm" onClick={() => markTaken(med.id)} className="text-xs">
                    <Check className="w-3 h-3 mr-1" />Take Now
                  </Button>
                )}
                {!med.taken && status === 'upcoming' && (
                  <Button size="sm" variant="outline" onClick={() => markTaken(med.id)} className="text-xs">
                    Mark Taken
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> Reminders auto-refresh every 30s</span>
        <span>·</span>
        <span>{meds.filter(m => m.taken).length}/{meds.length} taken today</span>
      </div>
    </div>
  );
};

export default MedicationSection;
