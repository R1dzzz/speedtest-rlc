import { motion } from 'framer-motion';
import { Link } from 'wouter';
import logoRlc from "@assets/rlc-logo_1771772041331.jpg";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-x-0 border-t-0 border-b border-white/10 px-4 md:px-8 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden group-hover:glow-primary transition-all duration-300 border border-white/20">
            <img 
              src={logoRlc} 
              alt="RLC Logo" 
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="font-display font-bold text-xl text-white group-hover:text-glow transition-all duration-300">
            Speedtest <span className="text-primary font-light">by RLC</span>
          </span>
        </Link>

        <div className="flex gap-4">
          <Link href="/history" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            History
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
