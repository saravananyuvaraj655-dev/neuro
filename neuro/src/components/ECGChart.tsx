import { useEffect, useRef, useState } from 'react';

const ECGChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<number[]>([]);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    // Generate initial ECG pattern
    const generatePattern = () => {
      const points: number[] = [];
      for (let i = 0; i < 600; i++) {
        const t = (i / 60) * Math.PI * 2;
        const p = 0.12 * Math.exp(-Math.pow((t % (Math.PI * 2)) - 0.8, 2) * 8);
        const q = -0.1 * Math.exp(-Math.pow((t % (Math.PI * 2)) - 1.9, 2) * 40);
        const r = 0.9 * Math.exp(-Math.pow((t % (Math.PI * 2)) - 2.1, 2) * 60);
        const s = -0.15 * Math.exp(-Math.pow((t % (Math.PI * 2)) - 2.3, 2) * 40);
        const tw = 0.18 * Math.exp(-Math.pow((t % (Math.PI * 2)) - 3.5, 2) * 6);
        const noise = (Math.random() - 0.5) * 0.02;
        points.push(p + q + r + s + tw + noise);
      }
      return points;
    };
    setData(generatePattern());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // ECG line
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 6;

      const offset = Math.floor(offsetRef.current);
      for (let i = 0; i < w; i++) {
        const idx = (i + offset) % data.length;
        const y = h / 2 - data[idx] * (h * 0.4);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweep line
      const sweepX = (offsetRef.current % w);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, h);
      ctx.stroke();

      offsetRef.current += 1.5;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [data]);

  return (
    <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💓</span>
          <h3 className="font-display font-semibold text-foreground text-sm">ECG Waveform</h3>
        </div>
        <span className="status-badge-normal">Live</span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="w-full h-40 rounded-lg"
        style={{ background: 'hsl(215 30% 6%)' }}
      />
    </div>
  );
};

export default ECGChart;
