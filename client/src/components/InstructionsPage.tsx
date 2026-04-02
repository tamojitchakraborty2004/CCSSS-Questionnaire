import { motion } from 'framer-motion';

interface InstructionsPageProps {
  onBegin: () => void;
}

const ratingScale = [
  { value: 0, label: 'Not at all', desc: 'You never or almost never experience this', color: 'from-emerald-500 to-teal-500' },
  { value: 1, label: 'Rarely', desc: 'You experience this once in a while', color: 'from-cyan-500 to-blue-500' },
  { value: 2, label: 'Sometimes', desc: 'You experience this occasionally', color: 'from-violet-500 to-purple-500' },
  { value: 3, label: 'Often', desc: 'You experience this frequently', color: 'from-orange-500 to-amber-500' },
  { value: 4, label: 'Very Often', desc: 'You experience this almost always', color: 'from-rose-500 to-pink-500' },
];

export function InstructionsPage({ onBegin }: InstructionsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10"
    >
      <div className="w-full max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-heading mb-5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
            Before You Begin
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
            About This Assessment
          </h1>
          <p className="text-white/50 text-sm">Please read carefully before proceeding</p>
        </motion.div>

        {/* What is CCSSS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 mb-5"
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">1</span>
            What is CCSSS?
          </h2>
          <p className="text-white/60 leading-relaxed text-sm">
            The <span className="text-white font-semibold">Combined College Student Stress Scale (CCSSS)</span> is a validated psychometric tool designed to measure the intensity and sources of stress experienced by college students. It evaluates stress across multiple dimensions — academic, social, financial, and health-related — and provides a comprehensive picture of your overall stress profile.
          </p>
          <p className="text-white/60 leading-relaxed text-sm mt-3">
            This assessment is being conducted as part of a research project on <span className="text-indigo-300">Workplace Stress Resilience Prediction</span> by CCSSS Research Project. Your honest responses will help build a validated dataset for improving stress prediction models.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 mb-5"
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold">2</span>
            How Does It Work?
          </h2>
          <div className="space-y-2.5">
            {[
              { icon: '📋', text: 'You will answer 10 core questions about your general stress levels.' },
              { icon: '🔀', text: 'Based on your responses, additional modules may be unlocked covering academic, health, financial, or social stress.' },
              { icon: '⏱️', text: 'The assessment takes approximately 10–15 minutes to complete.' },
              { icon: '📊', text: 'At the end, you will receive a personalized stress report with insights and recommendations.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rating Scale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xs font-bold">3</span>
            Understanding the Rating Scale
          </h2>
          <p className="text-white/50 text-sm mb-5">
            For each question, you will select a number from <span className="text-white font-semibold">0 to 4</span>. Here is what each number means:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {ratingScale.map((item, i) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-heading font-bold text-xl mb-3 shadow-lg`}>
                  {item.value}
                </div>
                <p className="text-white font-heading font-semibold text-sm mb-1">{item.label}</p>
                <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Begin Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBegin}
            className="group relative px-14 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-bold text-lg rounded-full overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              I Understand, Begin Assessment
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

      </div>
    </motion.div>
  );
}