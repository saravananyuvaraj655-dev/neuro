import { Truck, MapPin } from 'lucide-react';
import { Button } from './ui/button';

const ambulances = [
  { id: 'AMB-01', driver: 'Suresh K.', location: 'Near Block A', status: 'Available', phone: '+91-98765-43210' },
  { id: 'AMB-02', driver: 'Ravi M.', location: 'En route — P-1042', status: 'Dispatched', phone: '+91-98765-43211' },
  { id: 'AMB-03', driver: 'Deepak S.', location: 'Garage', status: 'Available', phone: '+91-98765-43212' },
  { id: 'AMB-04', driver: 'Vijay R.', location: 'En route — P-1087', status: 'Dispatched', phone: '+91-98765-43213' },
];

const AmbulanceSection = () => {
  const statusBadge = (s: string) => s === 'Available' ? 'status-badge-normal' : 'status-badge-warning';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Ambulance Fleet</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {ambulances.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-foreground">{a.id}</span>
              <span className={statusBadge(a.status)}>{a.status}</span>
            </div>
            <p className="text-sm text-foreground mb-1">🚑 {a.driver}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location}</p>
            {a.status === 'Available' && (
              <Button size="sm" className="mt-3 w-full">Dispatch</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbulanceSection;
