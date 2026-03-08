import { motion } from 'framer-motion';

interface RatingButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const LABELS = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very Often'];

export function RatingButtons({ value, onChange, disabled }: RatingButtonsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="grid grid-cols-5 gap-3 sm:gap-5">
        {[0, 1, 2, 3, 4].map((rating) => (
          <div key={rating} className="flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={() => !disabled && onChange(rating)}
              disabled={disabled}
              data-testid={`button-rating-${rating}`}
              whileHover={{ scale: disabled ? 1 : 1.1, y: -3 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              className={`
                relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full
                font-heading font-bold text-xl sm:text-2xl
                transition-all duration-300 disabled:cursor-not-allowed border-2
                ${
                  value === rating
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white shadow-[0_0_24px_rgba(139,92,246,0.6)]'
                    : 'bg-white/15 border-white/25 text-white/70 hover:bg-white/25 hover:border-white/50 hover:text-white'
                }
              `}
            >
              {rating}
              {value === rating && (
                <motion.div
                  layoutId="rating-glow"
                  className="absolute inset-0 rounded-full bg-purple-500/30 blur-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>

            {/* Label */}
            <span className={`text-[10px] sm:text-xs font-heading font-semibold text-center leading-tight transition-colors duration-300 ${
              value === rating ? 'text-purple-300' : 'text-white/40'
            }`}>
              {LABELS[rating]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}