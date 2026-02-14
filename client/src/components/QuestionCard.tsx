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
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      <div className="relative">
        {/* Glassmorphism Card */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
          
          {/* Question Number Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="absolute -top-4 left-8 bg-gradient-to-r from-indigo-500/80 to-purple-600/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-heading font-semibold shadow-lg border border-white/20"
            data-testid="text-question-number"
          >
            Question {questionNumber} of {totalQuestions}
          </motion.div>

          {/* Question Text */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-heading font-semibold text-white/90 text-center mb-12 mt-4 leading-relaxed tracking-tight"
            data-testid={testId || "text-question"}
          >
            {question}
          </motion.h2>

          {/* Rating Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <RatingButtons value={value} onChange={onChange} />
          </motion.div>

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
                className="group relative px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold text-lg rounded-full overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300"
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

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl blur-2xl -z-10" />
      </div>
    </motion.div>
  );
}
