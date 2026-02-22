import { motion, AnimatePresence } from 'framer-motion';
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto px-6 py-12"
    >
      <div className="relative">
        {/* Glassmorphism Card */}
        <div className="relative bg-black/40 backdrop-blur-[40px] rounded-[3rem] p-10 sm:p-16 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col items-center">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent rounded-[3rem] pointer-events-none" />
          
          {/* Question Number Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 bg-white/5 backdrop-blur-2xl text-white/40 px-6 py-2 rounded-full text-[10px] font-heading font-semibold tracking-[0.2em] uppercase border border-white/5 shadow-2xl"
            data-testid="text-question-number"
          >
            Question {questionNumber} / {totalQuestions}
          </motion.div>

          {/* Question Text */}
          <div className="w-full mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-4xl font-heading font-medium text-white/90 text-center leading-[1.2] tracking-tight"
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
            className="w-full"
          >
            <RatingButtons value={value} onChange={onChange} />
          </motion.div>

          {/* Labels */}
          <div className="w-full flex justify-between mt-10 px-4">
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-heading font-bold">Not at all</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-heading font-bold">Extremely</span>
          </div>

          {/* Next Button Container */}
          <div className="h-20 mt-12 flex items-center justify-center">
            <AnimatePresence>
              {value !== null && (
                <motion.button
                  key="next-button"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  onClick={onNext}
                  data-testid="button-next"
                  className="group relative px-14 py-4.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold text-lg rounded-full overflow-hidden shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all duration-500 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLastQuestion ? 'View Results' : 'Next Question'}
                    {!isLastQuestion && (
                      <motion.svg 
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7"/>
                      </motion.svg>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Shadow Glow */}
        <div className="absolute inset-x-10 -bottom-10 h-20 bg-indigo-500/10 blur-[100px] rounded-full -z-10" />
      </div>
    </motion.div>
  );
}
