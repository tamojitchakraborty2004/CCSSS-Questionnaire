import { motion } from 'framer-motion';

interface ModuleHeaderProps {
  moduleName: string;
  moduleNumber: number;
  totalModules: number;
  gradient: string;
}

export function ModuleHeader({ moduleName, moduleNumber, totalModules, gradient }: ModuleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto px-4 py-16"
    >
      <div className="text-center">
        {/* Module Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6"
        >
          <span className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-sm font-heading border border-white/20">
            Module {moduleNumber} of {totalModules}
          </span>
        </motion.div>

        {/* Module Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-4xl sm:text-5xl font-heading font-bold text-white mb-4 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
          data-testid="text-module-name"
        >
          {moduleName}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/70 text-lg max-w-2xl mx-auto"
        >
          Answer the following questions to help us better understand your specific stress factors
        </motion.p>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={`h-1 w-32 mx-auto mt-8 rounded-full bg-gradient-to-r ${gradient}`}
        />
      </div>
    </motion.div>
  );
}
