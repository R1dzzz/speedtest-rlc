import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { Link } from 'wouter';
import { useSpeedtestHistory } from '@/hooks/use-speedtest';
import { format } from 'date-fns';

export default function History() {
  const { data: history, isLoading, isError } = useSpeedtestHistory();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link href="/" className="p-2 rounded-full glass-panel hover:bg-white/10 transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-display font-bold text-white text-glow">Test History</h1>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 glass-panel rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center glass-panel rounded-2xl border-destructive/50">
          <p className="text-destructive font-medium">Failed to load history.</p>
        </div>
      ) : history?.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl flex flex-col items-center justify-center">
          <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">No tests yet</h3>
          <p className="text-muted-foreground">Run your first speed test to see history here.</p>
          <Link href="/" className="mt-6 px-6 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            Go to Test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history?.slice().reverse().map((test, i) => (
            <motion.div
              key={test.id || i} // Fallback to index if DB missing id during dev
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {test.createdAt ? format(new Date(test.createdAt), 'MMM d, yyyy • HH:mm') : 'Unknown Date'}
                </span>
              </div>
              
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 md:gap-12">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <ArrowDown className="w-3 h-3 text-blue-400" /> Download
                  </div>
                  <span className="font-display font-bold text-xl text-white group-hover:text-blue-400 transition-colors">
                    {test.download.toFixed(1)} <span className="text-sm font-normal text-white/50">Mbps</span>
                  </span>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <ArrowUp className="w-3 h-3 text-purple-400" /> Upload
                  </div>
                  <span className="font-display font-bold text-xl text-white group-hover:text-purple-400 transition-colors">
                    {test.upload.toFixed(1)} <span className="text-sm font-normal text-white/50">Mbps</span>
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Activity className="w-3 h-3 text-green-400" /> Ping
                  </div>
                  <span className="font-display font-bold text-xl text-white group-hover:text-green-400 transition-colors">
                    {test.ping.toFixed(0)} <span className="text-sm font-normal text-white/50">ms</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
