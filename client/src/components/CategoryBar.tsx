import { motion } from 'framer-motion';

interface CategoryBarProps {
  category: string;
  score: number;
  maxScore: number;
  color: string;
  delay: number;
}

export function CategoryBar({ category, score, maxScore, color, delay }: CategoryBarProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-white font-heading text-sm sm:text-base">{category}</span>
        <span className="text-white/70 text-sm" data-testid={`text-score-${category.toLowerCase().replace(/\s+/g, '-')}`}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
      </div>
    </motion.div>
  );
}
