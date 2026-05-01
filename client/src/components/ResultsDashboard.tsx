import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircularGauge } from './CircularGauge';
import { CategoryBar } from './CategoryBar';
import { Download, RotateCcw, Sparkles, Brain } from 'lucide-react';
import type { AssessmentResult, Response } from '@shared/schema';

interface UserInfo {
  name: string;
  email: string;
  age: string;
  studentId: string;
  gender: string;
  semester: string;
  scholarType: string;
  qualification: string;
}

interface ResultsDashboardProps {
  result: AssessmentResult;
  coreResponses: Response[];
  moduleResponses: Response[];
  userInfo: UserInfo;
  assessmentId: number | null;
  onRetake: () => void;
  onExportData: () => void;
}

export function ResultsDashboard({ result, coreResponses, moduleResponses, userInfo, assessmentId, onRetake, onExportData }: ResultsDashboardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [interpretationLoading, setInterpretationLoading] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const categoryColors = {
    'Academic Pressures': 'rgb(139, 92, 246)',
    'Social & Relationships': 'rgb(244, 63, 94)',
    'Financial & Practical Concerns': 'rgb(245, 158, 11)',
    'Health & Lifestyle': 'rgb(16, 185, 129)',
  };

  // Fetch Gemini interpretation
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);

    fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coreScore: result.coreScore,
        moduleScores: result.moduleScores,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        percentage: result.percentage,
        stressLevel: result.stressLevel,
        dominantCategories: result.dominantCategories,
        coreResponses,
        moduleResponses,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const text = data.interpretation || getFallbackMessage();
        setInterpretation(text);
        setInterpretationLoading(false);
        // Auto-generate PDF silently in background
        autoGeneratePDF(text);
      })
      .catch(() => {
        const fallback = getFallbackMessage();
        setInterpretation(fallback);
        setInterpretationLoading(false);
        autoGeneratePDF(fallback);
      });

    return () => clearTimeout(timer);
  }, []);

  const autoGeneratePDF = async (interpText: string) => {
    setPdfGenerating(true);
    try {
      const { generatePDFReport } = await import('@/lib/pdfGenerator');
      const base64 = await generatePDFReport(result, coreResponses, moduleResponses, userInfo, interpText);
      setPdfBase64(base64);
      // PDF is not stored in DB — generated fresh each time to save bandwidth
    } catch (e) {
      console.error('PDF auto-generation failed:', e);
    }
    setPdfGenerating(false);
  };

  const handleDownloadPDF = () => {
    if (pdfBase64) {
      // Already generated — just re-download
      const link = document.createElement('a');
      link.href = pdfBase64;
      link.download = `CCSSS-${userInfo.studentId}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    }
  };

  // Typewriter effect once interpretation is ready
  useEffect(() => {
    if (!interpretation) return;
    let index = 0;
    setTypewriterText('');
    const interval = setInterval(() => {
      if (index <= interpretation.length) {
        setTypewriterText(interpretation.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [interpretation]);

  const getFallbackMessage = () => {
    const categories = result.dominantCategories.join(' and ');
    if (result.stressLevel === 'Low') {
      return `Your stress level is Low. You're managing well overall. ${categories ? `Keep monitoring ${categories} areas.` : 'Continue your healthy habits.'}`;
    } else if (result.stressLevel === 'Moderate') {
      return `Your stress level is Moderate. ${categories ? `${categories} pressures are most prominent.` : 'Several areas need attention.'} Consider implementing stress management strategies.`;
    } else {
      return `Your stress level is High. ${categories ? `${categories} factors are significantly impacting you.` : 'Multiple areas require immediate attention.'} We recommend seeking support and prioritizing self-care.`;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * window.innerWidth, y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: window.innerHeight + 20, rotate: 360, opacity: 0 }}
              transition={{ duration: 3 + Math.random() * 2, ease: 'linear' }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6'][Math.floor(Math.random() * 4)] }}
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
              month: 'long', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </motion.div>

        {/* Gauge + Category Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
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

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col justify-center space-y-6"
          >
            <h3 className="text-2xl font-heading font-semibold text-white mb-4" data-testid="text-category-breakdown-title">
              Category Breakdown
            </h3>
            {Object.entries(result.moduleScores).map(([category, score], index) => (
              <CategoryBar
                key={category}
                category={category}
                score={score}
                maxScore={20}
                color={categoryColors[category as keyof typeof categoryColors] || 'rgb(156, 163, 175)'}
                delay={0.7 + index * 0.1}
              />
            ))}
            <CategoryBar
              category="Core Assessment"
              score={result.coreScore}
              maxScore={40}
              color="rgb(99, 102, 241)"
              delay={0.7 + Object.keys(result.moduleScores).length * 0.1}
            />
          </motion.div>
        </div>

        {/* AI Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-heading font-semibold uppercase tracking-wider">
              AI-Powered Interpretation
            </span>
          </div>

          {interpretationLoading ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                ))}
              </div>
              <span className="text-white/50 text-sm">Generating your personalized interpretation...</span>
            </div>
          ) : (
            <p className="text-white text-lg leading-relaxed font-heading min-h-[4rem]" data-testid="text-result-message">
              {typewriterText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-6 bg-white ml-1 align-middle"
              />
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating || !pdfBase64}
            data-testid="button-download-pdf"
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-semibold rounded-full overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span className="relative z-10">{pdfGenerating ? 'Generating PDF...' : 'Download PDF Report'}</span>
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