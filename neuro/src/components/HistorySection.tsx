import { History, Stethoscope } from 'lucide-react';

const historyData = [
  { type: 'Chronic', label: 'Diabetes Type II', detail: 'Diagnosed 2018 — Managed with Metformin', icon: '🩺' },
  { type: 'Surgery', label: 'Appendectomy', detail: 'Performed March 2020 — No complications', icon: '🏥' },
  { type: 'Chronic', label: 'Hypertension Stage 1', detail: 'Diagnosed 2021 — Controlled with Lisinopril', icon: '🩺' },
  { type: 'Allergy', label: 'Penicillin Allergy', detail: 'Documented since 2015 — Causes rash', icon: '⚠️' },
  { type: 'Complaint', label: 'Recurring Headaches', detail: 'Current — Under investigation, possible migraine', icon: '🧠' },
  { type: 'Family', label: 'Family History — Heart Disease', detail: 'Father had MI at age 55', icon: '❤️' },
];

const HistorySection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Medical History</h2>
      </div>
      <div className="grid gap-3">
        {historyData.map((item, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors" style={{ boxShadow: 'var(--shadow-card)' }}>
            <span className="text-2xl mt-0.5">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{item.type}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
