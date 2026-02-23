import { useState, useCallback, useRef, useEffect } from 'react';

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
  const [progress, setProgress] = useState(0); 
  const [currentValue, setCurrentValue] = useState(0); 
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setPhase('idle');
    setMetrics({ ping: 0, jitter: 0, download: 0, upload: 0 });
    setProgress(0);
    setCurrentValue(0);
  }, []);

  const startTest = useCallback(async () => {
    reset();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // --- 1. REAL PING TEST ---
      setPhase('ping');
      const pingSamples: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        // Melakukan request ringan ke server untuk cek latensi
        await fetch('/favicon.png', { method: 'HEAD', cache: 'no-store', signal });
        pingSamples.push(performance.now() - start);
        setProgress(((i + 1) / 5) * 100);
      }
      const avgPing = pingSamples.reduce((a, b) => a + b) / pingSamples.length;
      const jitter = Math.max(...pingSamples) - Math.min(...pingSamples);
      
      setMetrics(prev => ({ ...prev, ping: Number(avgPing.toFixed(2)), jitter: Number(jitter.toFixed(2)) }));
      setCurrentValue(avgPing);
      await new Promise(r => setTimeout(r, 500));

       // --- 2. REAL DOWNLOAD TEST (SUPPORT 100MB) ---
      setPhase('download');
      setProgress(0);
      
      const testDurationLimit = 15000; // Limit tes 15 detik biar kuota gak ludes
      const downloadStartTime = performance.now();
      
      // GANTI nama file ini sesuai nama file 100MB lu di folder public
      const response = await fetch('/dummy-100mb.bin', { cache: 'no-store', signal }); 
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Gagal membaca data');

      const contentLength = Number(response.headers.get('Content-Length')) || 104857600; // 100MB default
      let receivedLength = 0;

      while(true) {
        const { done, value } = await reader.read();
        const now = performance.now();
        const elapsed = now - downloadStartTime;

        // Berhenti kalau file habis ATAU sudah lewat limit waktu
        if (done || elapsed > testDurationLimit) {
          if (elapsed > testDurationLimit) await reader.cancel(); 
          break;
        }
        
        receivedLength += value.length;
        const durationInSeconds = elapsed / 1000;
        
        // Rumus Mbps: (Bytes * 8) / (Detik * 1024 * 1024)
        const mbps = (receivedLength * 8) / (durationInSeconds * 1024 * 1024);
        
        setCurrentValue(mbps);
        // Progress bar tetap jalan berdasarkan ukuran file 100MB
        setProgress(Math.min((receivedLength / contentLength) * 100, 100));
        setMetrics(prev => ({ ...prev, download: Number(mbps.toFixed(2)) }));
      }


      // --- 3. UPLOAD TEST (SIMULATED / PLACEHOLDER) ---
      // Karena upload butuh endpoint API khusus, kita set default atau simulasi kecil
      setPhase('upload');
      setCurrentValue(metrics.download * 0.5); // Biasanya upload ~50% dari download
      await new Promise(r => setTimeout(r, 2000));
      setMetrics(prev => ({ ...prev, upload: Number((prev.download * 0.5).toFixed(2)) }));

      // --- 4. COMPLETE ---
      setPhase('complete');
      setProgress(100);
      
      if (onComplete) {
        onComplete({
          ping: Number(avgPing.toFixed(2)),
          jitter: Number(jitter.toFixed(2)),
          download: Number(metrics.download.toFixed(2)),
          upload: Number((metrics.download * 0.5).toFixed(2))
        });
      }

    } catch (e: any) {
      if (e.name !== 'AbortError') console.error("Test failed", e);
    }
  }, [reset, onComplete, metrics.download]);

  useEffect(() => {
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, []);

  return { phase, metrics, progress, currentValue, startTest, reset };
}
