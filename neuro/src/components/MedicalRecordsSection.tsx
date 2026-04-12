import { useState } from 'react';
import { FolderOpen, Upload, FileText, Image, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MedicalRecord } from '@/lib/vitals';

const initialRecords: MedicalRecord[] = [
  { id: '1', name: 'Blood Test Report - March 2026', type: 'PDF', date: '2026-03-20', size: '1.2 MB' },
  { id: '2', name: 'Chest X-Ray', type: 'Image', date: '2026-03-15', size: '3.4 MB' },
  { id: '3', name: 'ECG Report - Feb 2026', type: 'PDF', date: '2026-02-28', size: '0.8 MB' },
  { id: '4', name: 'MRI Brain Scan', type: 'Image', date: '2026-01-10', size: '12.5 MB' },
  { id: '5', name: 'Prescription - Dr. Patel', type: 'PDF', date: '2026-03-28', size: '0.2 MB' },
];

const typeIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="w-5 h-5 text-destructive" />,
  Image: <Image className="w-5 h-5 text-primary" />,
  Report: <FileText className="w-5 h-5 text-secondary" />,
};

const MedicalRecordsSection = () => {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newRecord: MedicalRecord = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.includes('pdf') ? 'PDF' : 'Image',
          date: new Date().toISOString().split('T')[0],
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        };
        setRecords(prev => [newRecord, ...prev]);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Medical Records</h2>
        </div>
        <Button size="sm" onClick={handleUpload}><Upload className="w-3 h-3 mr-1" />Upload File</Button>
      </div>
      <div className="grid gap-3">
        {records.map((rec) => (
          <div key={rec.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:bg-muted/30 transition-colors" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {typeIcons[rec.type]}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{rec.name}</p>
                <p className="text-xs text-muted-foreground">{rec.date} · {rec.size} · {rec.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"><Eye className="w-3 h-3" /></Button>
              <Button variant="ghost" size="sm"><Download className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecordsSection;
