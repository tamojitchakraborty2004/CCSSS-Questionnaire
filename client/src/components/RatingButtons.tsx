import { motion } from 'framer-motion';

interface RatingButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RatingButtons({ value, onChange, disabled }: RatingButtonsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="grid grid-cols-5 gap-3 sm:gap-6">
        {[0, 1, 2, 3, 4].map((rating) => (
          <motion.button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating)}
            disabled={disabled}
            data-testid={`button-rating-${rating}`}
            whileHover={{ scale: disabled ? 1 : 1.1, y: -4 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`
              relative aspect-square flex items-center justify-center rounded-2xl font-heading font-bold text-xl sm:text-3xl
              transition-all duration-500 disabled:cursor-not-allowed border
              ${
                value === rating
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_40px_rgba(79,70,229,0.4)]'
                  : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10 hover:border-white/10 hover:text-white/50'
              }
            `}
          >
            <span className="relative z-10">{rating}</span>
            {value === rating && (
              <motion.div
                layoutId="rating-glow"
                className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
