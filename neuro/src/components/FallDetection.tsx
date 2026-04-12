import { motion } from 'framer-motion';

interface FallDetectionProps {
  fallDetected: boolean;
}

const FallDetection = ({ fallDetected }: FallDetectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`vital-card ${fallDetected ? 'vital-abnormal' : 'vital-normal'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">🧍</span>
        <span className={fallDetected ? 'status-badge-abnormal' : 'status-badge-normal'}>
          {fallDetected ? 'FALL DETECTED' : 'Normal'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground font-medium mb-1">Fall Detection</p>
      <span className="text-lg font-display font-bold text-foreground">
        {fallDetected ? '⚠️ Fall + No Movement' : 'Stable — No falls'}
      </span>
    </motion.div>
  );
};

export default FallDetection;
