import { motion } from 'framer-motion';
import { TestPhase } from '@/hooks/use-testing-engine';

interface MainGaugeProps {
  phase: TestPhase;
  currentValue: number;
  progress: number;
}

export function MainGauge({ phase, currentValue, progress }: MainGaugeProps) {
  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';
  const isActive = !isIdle && !isComplete;

  const getUnit = () => {
    if (phase === 'ping') return 'ms';
    if (phase === 'download' || phase === 'upload') return 'Mbps';
    return '';
  };

  const getLabel = () => {
    if (phase === 'ping') return 'Testing Ping';
    if (phase === 'download') return 'Testing Download';
    if (phase === 'upload') return 'Testing Upload';
    if (phase === 'complete') return 'Test Complete';
    return 'Ready';
  };

  // SVG Circle parameters
  const size = 300;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-full max-w-[320px] mx-auto aspect-square">
      {/* Outer decorative rings */}
      <div className="absolute inset-0 rounded-full border border-white/5 scale-110" />
      <div className="absolute inset-0 rounded-full border border-white/5 scale-125" />
      
      {/* Background glow when active */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-full bg-primary/10 blur-3xl"
        />
      )}

      {/* SVG Progress Circle */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 transform"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </svg>

      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full glass-panel m-4 border-white/10 z-10">
        <motion.span 
          key={phase} // re-animate when phase changes
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-primary uppercase tracking-widest mb-2"
        >
          {getLabel()}
        </motion.span>
        
        <div className="flex items-baseline justify-center gap-2 px-6">
          <span className="font-display font-bold text-6xl tracking-tighter text-white text-glow">
            {isActive ? currentValue.toFixed(1) : isComplete ? "Done" : "0.0"}
          </span>
          {isActive && (
            <span className="text-xl text-white/60 font-medium">
              {getUnit()}
            </span>
          )}
        </div>

        {/* Pulse dots for active state */}
        {isActive && (
          <div className="absolute bottom-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
