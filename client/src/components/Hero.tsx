import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from 'framer-motion';
import { Sparkles } from 'lucide-react';
import React from 'react';

interface HeroProps {
  onStart: () => void;
}

export function Hero({ onStart }: HeroProps) {
  // 🧠 Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth follow
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 300 });

  // 🔥 Cursor light gradient
  const background = useMotionTemplate`
    radial-gradient(
      250px circle at ${smoothX}px ${smoothY}px,
      rgba(139, 92, 246, 0.3),
      transparent 70%
    )
  `;

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
    >
      {/* 🌌 Background (BOTTOM) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3), transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* 🔥 Cursor Light (MIDDLE LAYER) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-10"
        style={{ background }}
      />

      {/* ✨ Content (TOP LAYER) */}
      <div className="relative z-20 text-center max-w-5xl">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 blur-2xl opacity-60 animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 leading-tight"
        >
          Combined College Student
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Stress Scale
          </span>
        </motion.h1>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-block mb-8 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
        >
          <span className="text-white/90 font-heading text-lg sm:text-xl tracking-wider">
            CCSSS
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Discover your stress and resilience through a guided, cinematic experience.
          <br />
          <span className="text-white/60 text-base sm:text-lg mt-2 block">
            A personalized assessment that adapts to your unique situation.
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-12 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold text-xl rounded-full overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(139,92,246,0.8)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Assessment
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-16 flex flex-col sm:flex-row gap-8 justify-center items-center text-white/50 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>10-15 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Adaptive Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Personalized Insights</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/20 to-transparent z-10" />
    </div>
  );
}