import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CircularGaugeProps {
  score: number;
  maxScore: number;
  stressLevel: string;
}

export function CircularGauge({ score, maxScore, stressLevel }: CircularGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (percentage <= 33) return { from: 'rgb(16, 185, 129)', to: 'rgb(5, 150, 105)' };
    if (percentage <= 66) return { from: 'rgb(245, 158, 11)', to: 'rgb(251, 191, 36)' };
    return { from: 'rgb(239, 68, 68)', to: 'rgb(220, 38, 38)' };
  };

  const colors = getColor();

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 280 280">
        {/* Background Circle */}
        <circle
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="20"
        />

        {/* Animated Progress Circle */}
        <motion.circle
          cx="140"
          cy="140"
          r="120"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <div className="text-6xl font-heading font-bold text-white mb-2" data-testid="text-total-score">
            {animatedScore}
          </div>
          <div className="text-xl text-white/60 font-heading" data-testid="text-max-score">out of {maxScore}</div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className={`mt-4 px-6 py-2 rounded-full font-heading font-semibold text-lg ${
              percentage <= 33
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : percentage <= 66
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
            data-testid="text-stress-level"
          >
            {stressLevel} Stress
          </motion.div>
        </motion.div>
      </div>

      {/* Outer Glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{
          background: `radial-gradient(circle, ${colors.from}, transparent)`,
        }}
      />
    </div>
  );
}
