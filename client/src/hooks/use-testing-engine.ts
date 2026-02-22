import { useState, useCallback, useRef, useEffect } from 'react';
import { animate } from 'framer-motion';

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';

export interface TestMetrics {
  ping: number;
  jitter: number;
  download: number;
  upload: number;
}

export function useTestingEngine(onComplete?: (metrics: TestMetrics) => void) {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [metrics, setMetrics] = useState<TestMetrics>({ ping: 0, jitter: 0, download: 0, upload: 0 });
  const [progress, setProgress] = useState(0); // 0 to 100 for current phase
  const [currentValue, setCurrentValue] = useState(0); // Live rolling number
  
  const animationRef = useRef<any>(null);

  const reset = useCallback(() => {
    setPhase('idle');
    setMetrics({ ping: 0, jitter: 0, download: 0, upload: 0 });
    setProgress(0);
    setCurrentValue(0);
    if (animationRef.current) animationRef.current.stop();
  }, []);

  const runTestPhase = async (
    phaseName: TestPhase,
    durationMs: number,
    targetValue: number,
    fluctuation: number,
    metricKey: keyof TestMetrics
  ) => {
    setPhase(phaseName);
    setProgress(0);
    setCurrentValue(0);

    return new Promise<void>((resolve) => {
      // Animate Progress Bar
      animate(0, 100, {
        duration: durationMs / 1000,
        ease: "linear",
        onUpdate: (latest) => setProgress(latest)
      });

      // Animate the rolling value with realistic network-like fluctuations
      let startValue = 0;
      animationRef.current = animate(0, targetValue, {
        duration: durationMs / 1000,
        ease: phaseName === 'ping' ? "easeOut" : "easeInOut",
        onUpdate: (latest) => {
          // Add some randomness to make it look like real network traffic
          const noise = (Math.random() - 0.5) * fluctuation;
          // As we get closer to 100% progress, reduce the noise to settle on the final value
          const progressFactor = progress / 100;
          const dampening = 1 - Math.pow(progressFactor, 4); 
          
          let displayVal = latest + (noise * dampening);
          if (displayVal < 0) displayVal = 0;
          
          setCurrentValue(displayVal);
          setMetrics(prev => ({ ...prev, [metricKey]: displayVal }));
        },
        onComplete: () => {
          // Snap to final generated value
          const finalVal = targetValue + ((Math.random() - 0.5) * (fluctuation * 0.2));
          const roundedFinal = Number(finalVal.toFixed(2));
          setCurrentValue(roundedFinal);
          setMetrics(prev => ({ ...prev, [metricKey]: roundedFinal }));
          resolve();
        }
      });
    });
  };

  const startTest = useCallback(async () => {
    reset();
    
    // Generating realistic dummy targets for the simulation
    const targetPing = 12 + Math.random() * 20;
    const targetJitter = 1 + Math.random() * 5;
    const targetDownload = 80 + Math.random() * 150; // 80 - 230 Mbps
    const targetUpload = 30 + Math.random() * 60;   // 30 - 90 Mbps

    try {
      // 1. Ping Phase
      await runTestPhase('ping', 2000, targetPing, 10, 'ping');
      // Set jitter immediately after ping (simulated as derived from ping variance)
      setMetrics(prev => ({ ...prev, jitter: Number(targetJitter.toFixed(2)) }));
      
      await new Promise(r => setTimeout(r, 500)); // Pause

      // 2. Download Phase
      await runTestPhase('download', 5000, targetDownload, 30, 'download');
      
      await new Promise(r => setTimeout(r, 500)); // Pause

      // 3. Upload Phase
      await runTestPhase('upload', 5000, targetUpload, 15, 'upload');

      // 4. Complete
      setPhase('complete');
      setProgress(100);
      
      // Pass final metrics up
      if (onComplete) {
        // Re-read from state would be stale in this closure, 
        // so we construct the final object
        const finalMetrics = {
          ping: Number(targetPing.toFixed(2)),
          jitter: Number(targetJitter.toFixed(2)),
          download: Number(targetDownload.toFixed(2)),
          upload: Number(targetUpload.toFixed(2))
        };
        onComplete(finalMetrics);
      }

    } catch (e) {
      console.error("Test aborted or failed", e);
    }
  }, [reset, onComplete]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) animationRef.current.stop();
    };
  }, []);

  return {
    phase,
    metrics,
    progress,
    currentValue,
    startTest,
    reset
  };
}
