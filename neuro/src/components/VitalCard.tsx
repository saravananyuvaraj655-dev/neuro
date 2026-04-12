import { motion } from 'framer-motion';
import type { VitalSign } from '../lib/vitals';

interface VitalCardProps {
  vital: VitalSign;
  index: number;
}

const statusLabel = {
  normal: 'Normal',
  warning: 'Warning',
  abnormal: 'Abnormal',
};

const VitalCard = ({ vital, index }: VitalCardProps) => {
  const statusClass = `vital-${vital.status}`;
  const badgeClass = `status-badge-${vital.status}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`vital-card ${statusClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{vital.icon}</span>
        <span className={badgeClass}>{statusLabel[vital.status]}</span>
      </div>
      <p className="text-xs text-muted-foreground font-medium mb-1">{vital.name}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-bold text-foreground">{vital.value}</span>
        <span className="text-xs text-muted-foreground">{vital.unit}</span>
      </div>
    </motion.div>
  );
};

export default VitalCard;
