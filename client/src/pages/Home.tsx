import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowUp, Activity, Zap, RotateCcw, Play, Globe, Server } from 'lucide-react';
import { useTestingEngine } from '@/hooks/use-testing-engine';
import { useRecordSpeedtest } from '@/hooks/use-speedtest';
import { MetricCard } from '@/components/MetricCard';
import { MainGauge } from '@/components/MainGauge';
import { useToast } from '@/hooks/use-toast';

interface NetworkInfo {
  ip: string;
  org: string;
}

export default function Home() {
  const { toast } = useToast();
  const { mutate: recordTest, isPending: isRecording } = useRecordSpeedtest();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  
  const { 
    phase, 
    metrics, 
    progress, 
    currentValue, 
    startTest, 
    reset 
  } = useTestingEngine((finalMetrics) => {
    // Called when the engine completes the full suite
    recordTest(finalMetrics, {
      onSuccess: () => {
        toast({
          title: "Test Complete",
          description: "Your results have been saved successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Warning",
          description: "Test completed, but failed to save to history.",
          variant: "destructive"
        });
        console.error("Save error:", err);
      }
    });
  });

  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setNetworkInfo({
          ip: data.ip,
          org: data.org
        });
      })
      .catch(err => console.error("Failed to fetch IP info:", err));
  }, []);

  // Prevent accidental navigation during test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase !== 'idle' && phase !== 'complete') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center max-w-7xl mx-auto">
      
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left Column: Visualization & Controls */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          <MainGauge phase={phase} progress={progress} currentValue={currentValue} />
          
          <div className="mt-12 h-20 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isIdle && (
                <motion.button
                  key="btn-start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={startTest}
                  className="group relative flex items-center gap-3 px-10 py-4 rounded-full bg-primary text-primary-foreground font-display font-bold text-xl glow-primary-intense hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Play className="w-6 h-6 fill-current" />
                  <span className="relative z-10">MULAI TES</span>
                </motion.button>
              )}

              {isComplete && (
                <motion.button
                  key="btn-reset"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={reset}
                  disabled={isRecording}
                  className="flex items-center gap-2 px-8 py-3 rounded-full glass-panel text-white hover:bg-white/10 hover:glow-primary transition-all duration-300 disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-medium">Tes Ulang</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Network Info */}
          {networkInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 w-full glass-panel p-4 rounded-2xl flex flex-col gap-3 border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">IP Address</p>
                  <p className="text-sm text-white font-mono">{networkInfo.ip}</p>
                </div>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Server className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Provider / ISP</p>
                  <p className="text-sm text-white font-medium">{networkInfo.org}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Metrics Dashboard */}
        <div className="flex-1 w-full grid grid-cols-2 gap-4 md:gap-6">
          <MetricCard
            label="Download"
            value={metrics.download}
            unit="Mbps"
            icon={ArrowDown}
            isActive={phase === 'download'}
            isPending={isIdle || (phase !== 'complete' && phase !== 'download' && metrics.download === 0)}
            delay={0.1}
          />
          <MetricCard
            label="Upload"
            value={metrics.upload}
            unit="Mbps"
            icon={ArrowUp}
            isActive={phase === 'upload'}
            isPending={isIdle || (phase !== 'complete' && phase !== 'upload' && metrics.upload === 0)}
            delay={0.2}
          />
          <MetricCard
            label="Ping"
            value={metrics.ping}
            unit="ms"
            icon={Activity}
            isActive={phase === 'ping'}
            isPending={isIdle || (phase !== 'complete' && phase !== 'ping' && metrics.ping === 0)}
            delay={0.3}
          />
          <MetricCard
            label="Jitter"
            value={metrics.jitter}
            unit="ms"
            icon={Zap}
            isActive={false} // Jitter usually calculated instantly alongside ping
            isPending={isIdle || metrics.jitter === 0}
            delay={0.4}
          />
        </div>

      </div>
    </div>
  );
}
