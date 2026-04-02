import { motion, AnimatePresence } from 'framer-motion';
import { RatingButtons } from './RatingButtons';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  value: number | null;
  onChange: (value: number) => void;
  onNext: () => void;
  onPrev?: () => void;
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
  onPrev,
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
        <div className="relative bg-white/15 backdrop-blur-lg rounded-2xl p-8 sm:p-12 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">

          {/* Question Number Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="absolute -top-4 left-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-heading font-semibold shadow-lg"
            data-testid="text-question-number"
          >
            Question {questionNumber} of {totalQuestions}
          </motion.div>

          {/* Question Text */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-heading font-semibold text-white text-center mb-12 mt-4 leading-relaxed"
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

          {/* Navigation Buttons */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {/* Back Button */}
            {onPrev && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={onPrev}
                className="px-8 py-4 bg-white/10 border border-white/20 text-white/70 font-heading font-semibold text-lg rounded-full hover:bg-white/20 hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5m7-7-7 7 7 7"/>
                </svg>
                Back
              </motion.button>
            )}

            {/* Next Button */}
            <AnimatePresence>
              {value !== null && (
                <motion.button
                  key="next-button"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={onNext}
                  data-testid="button-next"
                  className="group relative px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold text-lg rounded-full overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 flex items-center gap-2"
                >
                  <span className="relative z-10">{isLastQuestion ? 'View Results' : 'Continue'}</span>
                  {!isLastQuestion && (
                    <svg className="relative z-10 group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-7-7 7 7-7 7"/>
                    </svg>
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-2xl blur-2xl -z-10" />
      </div>
    </motion.div>
  );
}