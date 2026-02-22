import { motion } from 'framer-motion';
import { RatingButtons } from './RatingButtons';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  value: number | null;
  onChange: (value: number) => void;
  onNext: () => void;
  isLastQuestion?: boolean;
  testId?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  value,
  onChange,
  onNext,
  isLastQuestion,
  testId,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto px-6"
    >
      <div className="relative pt-6">
        {/* Glassmorphism Card */}
        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-10 sm:p-14 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-visible">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2.5rem] pointer-events-none" />
          
          {/* Question Number Badge */}
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-500/10 backdrop-blur-2xl text-indigo-200/90 px-8 py-2.5 rounded-full text-xs font-heading font-semibold tracking-widest uppercase border border-white/10 shadow-2xl whitespace-nowrap"
            data-testid="text-question-number"
          >
            Question {questionNumber} / {totalQuestions}
          </motion.div>

          {/* Question Text */}
          <div className="min-h-[120px] flex items-center justify-center mb-12 mt-6">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-heading font-medium text-white/90 text-center leading-tight tracking-tight"
              data-testid={testId || "text-question"}
            >
              {question}
            </motion.h2>
          </div>

          {/* Rating Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RatingButtons value={value} onChange={onChange} />
          </motion.div>

          {/* Labels */}
          <div className="flex justify-between mt-8 px-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-heading font-medium">Not at all</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-heading font-medium">Extremely</span>
          </div>

          {/* Next Button */}
          {value !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 flex justify-center"
            >
              <button
                onClick={onNext}
                data-testid="button-next"
                className="group relative px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold text-lg rounded-full overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all duration-300"
              >
                <span className="relative z-10">
                  {isLastQuestion ? 'View Results' : 'Continue'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </motion.div>
          )}
        </div>

        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-[3rem] blur-3xl -z-10" />
      </div>
    </motion.div>
  );
}
