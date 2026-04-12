import { AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const emergencies = [
  { id: 'P-1042', name: 'Rajesh Verma', age: 67, type: 'Multiple Abnormal Vitals — SpO₂ 86%, HR 135 bpm', time: '2 min ago', severity: 'critical' },
  { id: 'P-1087', name: 'Lakshmi Nair', age: 74, type: 'Fall Detected — No movement for 8 seconds', time: '5 min ago', severity: 'critical' },
  { id: 'P-1023', name: 'Amit Deshmukh', age: 58, type: 'Hypertensive Crisis — BP 185/125 mmHg', time: '12 min ago', severity: 'high' },
  { id: 'P-1055', name: 'Priya Iyer', age: 45, type: 'Bradycardia — HR 42 bpm, unresponsive', time: '18 min ago', severity: 'critical' },
];

const HospitalEmergencies = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="font-display text-xl font-bold text-foreground">Active Emergencies</h2>
        <span className="status-badge-abnormal ml-2">{emergencies.length} Active</span>
      </div>
      <div className="grid gap-3">
        {emergencies.map((e) => (
          <div key={e.id} className="rounded-xl border p-4 flex items-center justify-between" style={{
            borderColor: e.severity === 'critical' ? 'hsl(var(--vital-abnormal) / 0.4)' : 'hsl(var(--vital-warning) / 0.3)',
            background: e.severity === 'critical' ? 'hsl(var(--vital-abnormal-bg))' : 'hsl(var(--vital-warning-bg))',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm text-destructive-foreground" style={{ background: 'hsl(var(--vital-abnormal))' }}>
                🚨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{e.name}</p>
                  <span className="text-xs text-muted-foreground">({e.id})</span>
                  <span className="text-[10px] text-muted-foreground">Age {e.age}</span>
                </div>
                <p className="text-xs text-destructive font-medium">{e.type}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.time}</p>
              </div>
            </div>
            <Button size="sm" variant="destructive"><Eye className="w-3 h-3 mr-1" />View Vitals</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalEmergencies;
