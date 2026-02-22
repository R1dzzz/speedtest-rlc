import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  isActive?: boolean;
  isPending?: boolean;
  delay?: number;
}

export function MetricCard({ label, value, unit, icon: Icon, isActive, isPending, delay = 0 }: MetricCardProps) {
  const displayValue = isPending ? '--' : typeof value === 'number' ? value.toFixed(1) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl glass-panel p-5 md:p-6 transition-all duration-300",
        isActive ? "border-primary/50 glow-primary scale-[1.02]" : "border-white/5 hover:border-white/10"
      )}
    >
      {/* Active Indicator Glow inside card */}
      {isActive && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
      )}

      <div className="flex items-center justify-between mb-4">
        <span className={cn("text-sm font-medium uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
          {label}
        </span>
        <div className={cn("p-2 rounded-full", isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-3xl md:text-4xl font-bold font-display tracking-tight",
          isActive ? "text-white text-glow" : "text-foreground",
          isPending && "opacity-50"
        )}>
          {displayValue}
        </span>
        <span className="text-sm text-muted-foreground font-medium">
          {unit}
        </span>
      </div>
      
      {/* Progress line at bottom if active */}
      {isActive && (
        <motion.div 
          className="absolute bottom-0 left-0 h-1 bg-primary"
          layoutId="activeMetricIndicator"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}
