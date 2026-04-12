import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusBannerProps {
  status: 'normal' | 'alert' | 'emergency';
  firstAidSuggestions?: string[];
}

const StatusBanner = ({ status, firstAidSuggestions = [] }: StatusBannerProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'normal' && (
          <div className="rounded-xl px-5 py-3 flex items-center gap-3 border" style={{ background: 'hsl(var(--vital-normal-bg))', borderColor: 'hsl(var(--vital-normal) / 0.3)' }}>
            <CheckCircle className="w-5 h-5" style={{ color: 'hsl(var(--vital-normal))' }} />
            <span className="font-semibold text-sm" style={{ color: 'hsl(var(--vital-normal))' }}>Patient is Normal — All vitals within safe range</span>
          </div>
        )}
        {status === 'alert' && (
          <div className="rounded-xl px-5 py-3 flex items-center gap-3 border" style={{ background: 'hsl(var(--vital-warning-bg))', borderColor: 'hsl(var(--vital-warning) / 0.3)' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(var(--vital-warning))' }} />
            <span className="font-semibold text-sm" style={{ color: 'hsl(var(--vital-warning))' }}>Alert: Abnormal vitals detected — Monitor closely</span>
          </div>
        )}
        {status === 'emergency' && (
          <div className="space-y-2">
            <div className="emergency-banner rounded-xl">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-sm">🚨 EMERGENCY: Multiple critical vitals — Immediate medical attention required!</span>
            </div>
            {firstAidSuggestions.length > 0 && (
              <div className="rounded-xl px-5 py-3 border" style={{ background: 'hsl(var(--vital-abnormal-bg))', borderColor: 'hsl(var(--vital-abnormal) / 0.3)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(var(--vital-abnormal))' }}>First Aid Suggestions:</p>
                <ul className="space-y-1">
                  {firstAidSuggestions.map((s, i) => (
                    <li key={i} className="text-xs text-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBanner;
