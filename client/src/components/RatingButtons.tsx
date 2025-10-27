import { motion } from 'framer-motion';

interface RatingButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RatingButtons({ value, onChange, disabled }: RatingButtonsProps) {
  const labels = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very Often'];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
        {[0, 1, 2, 3, 4].map((rating) => (
          <motion.button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating)}
            disabled={disabled}
            data-testid={`button-rating-${rating}`}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`
              relative w-14 h-14 sm:w-16 sm:h-16 rounded-full font-heading font-semibold text-lg
              transition-all duration-300 disabled:cursor-not-allowed
              ${
                value === rating
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              }
            `}
          >
            {rating}
            {value === rating && (
              <motion.div
                layoutId="rating-glow"
                className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 blur-xl opacity-60"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-white/70 text-center flex-wrap justify-center max-w-xl">
        {labels.map((label, idx) => (
          <span
            key={idx}
            className={`px-2 ${value === idx ? 'text-white font-semibold' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
