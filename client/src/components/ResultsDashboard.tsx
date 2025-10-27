import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircularGauge } from './CircularGauge';
import { CategoryBar } from './CategoryBar';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import type { AssessmentResult } from '@shared/schema';

interface ResultsDashboardProps {
  result: AssessmentResult;
  onRetake: () => void;
  onDownloadPDF: () => void;
  onExportData: () => void;
}

export function ResultsDashboard({ result, onRetake, onDownloadPDF, onExportData }: ResultsDashboardProps) {
  const [typewriterText, setTypewriterText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const getMessage = () => {
    const categories = result.dominantCategories.join(' and ');
    if (result.stressLevel === 'Low') {
      return `Your stress level is Low. You're managing well overall. ${categories ? `Keep monitoring ${categories} areas.` : 'Continue your healthy habits.'}`;
    } else if (result.stressLevel === 'Moderate') {
      return `Your stress level is Moderate. ${categories ? `${categories} pressures are most prominent.` : 'Several areas need attention.'} Consider implementing stress management strategies.`;
    } else {
      return `Your stress level is High. ${categories ? `${categories} factors are significantly impacting you.` : 'Multiple areas require immediate attention.'} We recommend seeking support and prioritizing self-care.`;
    }
  };

  const message = getMessage();

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index <= message.length) {
        setTypewriterText(message.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [message]);

  const categoryColors = {
    Academic: 'rgb(139, 92, 246)',
    Social: 'rgb(244, 63, 94)',
    Financial: 'rgb(245, 158, 11)',
    Health: 'rgb(16, 185, 129)',
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                ease: 'linear',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4" data-testid="text-results-title">
            Your Assessment Results
          </h2>
          <p className="text-white/70 text-lg" data-testid="text-completion-date">
            Completed on {new Date(result.completedAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </motion.div>

        {/* Main Results Container */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Circular Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center items-center"
          >
            <CircularGauge 
              score={result.totalScore} 
              maxScore={result.maxScore} 
              stressLevel={result.stressLevel}
            />
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col justify-center space-y-6"
          >
            <h3 className="text-2xl font-heading font-semibold text-white mb-4" data-testid="text-category-breakdown-title">
              Category Breakdown
            </h3>
            {Object.entries(result.moduleScores).map(([category, score], index) => {
              const maxModuleScore = 20;
              return (
                <CategoryBar
                  key={category}
                  category={category}
                  score={score}
                  maxScore={maxModuleScore}
                  color={categoryColors[category as keyof typeof categoryColors] || 'rgb(156, 163, 175)'}
                  delay={0.7 + index * 0.1}
                />
              );
            })}
            <CategoryBar
              category="Core Assessment"
              score={result.coreScore}
              maxScore={40}
              color="rgb(99, 102, 241)"
              delay={0.7 + Object.keys(result.moduleScores).length * 0.1}
            />
          </motion.div>
        </div>

        {/* Typewriter Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8"
        >
          <p className="text-white text-lg leading-relaxed font-heading min-h-[4rem]" data-testid="text-result-message">
            {typewriterText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-6 bg-white ml-1 align-middle"
            />
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={onDownloadPDF}
            data-testid="button-download-pdf"
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 flex items-center gap-3"
          >
            <Download className="w-5 h-5" />
            <span className="relative z-10">Download PDF Report</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          <button
            onClick={onExportData}
            data-testid="button-export-data"
            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-heading font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
          >
            <Download className="w-5 h-5" />
            Export Data (CSV)
          </button>

          <button
            onClick={onRetake}
            data-testid="button-retake"
            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-heading font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Assessment
          </button>
        </motion.div>
      </div>
    </div>
  );
}
