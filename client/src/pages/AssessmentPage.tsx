import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { ParticleBackground } from '@/components/ParticleBackground';
import { QuestionCard } from '@/components/QuestionCard';
import { ModuleHeader } from '@/components/ModuleHeader';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ProgressBar } from '@/components/ProgressBar';
import { CORE_QUESTIONS, MODULES, type AssessmentResult, type Response } from '@shared/schema';

type Stage = 'hero' | 'onboarding' | 'core' | 'module-intro' | 'module' | 'results';

export default function AssessmentPage() {
  const [stage, setStage] = useState<Stage>('hero');
  const [userInfo, setUserInfo] = useState({ name: '', email: '', age: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [coreResponses, setCoreResponses] = useState<Response[]>([]);
  const [moduleResponses, setModuleResponses] = useState<Response[]>([]);
  const [activeModules, setActiveModules] = useState<typeof MODULES>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentModuleQuestionIndex, setCurrentModuleQuestionIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [backgroundGradient, setBackgroundGradient] = useState('from-indigo-950 via-purple-950 to-slate-950');

  const handleStart = () => {
    setStage('onboarding');
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email && userInfo.age) {
      setStage('core');
    }
  };

  const handleCoreResponse = (rating: number) => {
    const questionId = CORE_QUESTIONS[currentQuestionIndex].id;
    const newResponses = [...coreResponses];
    const existingIndex = newResponses.findIndex(r => r.questionId === questionId);
    
    if (existingIndex >= 0) {
      newResponses[existingIndex] = { questionId, rating };
    } else {
      newResponses.push({ questionId, rating });
    }
    
    setCoreResponses(newResponses);
  };

  const handleCoreNext = () => {
    if (currentQuestionIndex < CORE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Core questions complete - determine which modules to show
      const coreScore = coreResponses.reduce((sum, r) => sum + r.rating, 0);
      const modules: typeof MODULES = [];

      // Check conditions for each module
      const heavyWorkload = coreResponses.find(r => r.questionId === 'c1')?.rating || 0;
      const pressureGrades = coreResponses.find(r => r.questionId === 'c2')?.rating || 0;
      const poorSleep = coreResponses.find(r => r.questionId === 'c3')?.rating || 0;
      const financial = coreResponses.find(r => r.questionId === 'c4')?.rating || 0;

      // Academic module: Heavy workload ≥ 2 AND Pressure to maintain grades ≥ 2
      if (heavyWorkload >= 2 && pressureGrades >= 2) {
        modules.push(MODULES.find(m => m.id === 'academic')!);
      }

      // Health module: Poor sleep ≥ 2
      if (poorSleep >= 2) {
        modules.push(MODULES.find(m => m.id === 'health')!);
      }

      // Financial module: Financial difficulties ≥ 2
      if (financial >= 2) {
        modules.push(MODULES.find(m => m.id === 'financial')!);
      }

      // Social module: Everyone gets this
      modules.push(MODULES.find(m => m.id === 'social')!);

      setActiveModules(modules);

      if (coreScore > 13 && modules.length > 0) {
        setCurrentModuleIndex(0);
        setCurrentModuleQuestionIndex(0);
        setStage('module-intro');
      } else {
        // Skip modules and go straight to results
        calculateResults([]);
      }
    }
  };

  const handleModuleResponse = (rating: number) => {
    const module = activeModules[currentModuleIndex];
    const questionId = module.questions[currentModuleQuestionIndex].id;
    const newResponses = [...moduleResponses];
    const existingIndex = newResponses.findIndex(r => r.questionId === questionId);
    
    if (existingIndex >= 0) {
      newResponses[existingIndex] = { questionId, rating };
    } else {
      newResponses.push({ questionId, rating });
    }
    
    setModuleResponses(newResponses);
  };

  const handleModuleNext = () => {
    const module = activeModules[currentModuleIndex];
    
    if (currentModuleQuestionIndex < module.questions.length - 1) {
      setCurrentModuleQuestionIndex(currentModuleQuestionIndex + 1);
    } else {
      // Module complete
      if (currentModuleIndex < activeModules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
        setCurrentModuleQuestionIndex(0);
        setStage('module-intro');
      } else {
        // All modules complete
        calculateResults(moduleResponses);
      }
    }
  };

  const calculateResults = (finalModuleResponses: Response[]) => {
    const coreScore = coreResponses.reduce((sum, r) => sum + r.rating, 0);
    
    const moduleScores: Record<string, number> = {};
    activeModules.forEach(module => {
      const score = finalModuleResponses
        .filter(r => module.questions.some(q => q.id === r.questionId))
        .reduce((sum, r) => sum + r.rating, 0);
      moduleScores[module.name] = score;
    });

    const totalModuleScore = Object.values(moduleScores).reduce((sum, score) => sum + score, 0);
    const totalScore = coreScore + totalModuleScore;
    const maxScore = 40 + (activeModules.length * 20);
    const percentage = (totalScore / maxScore) * 100;

    let stressLevel: 'Low' | 'Moderate' | 'High';
    if (percentage <= 33) stressLevel = 'Low';
    else if (percentage <= 66) stressLevel = 'Moderate';
    else stressLevel = 'High';

    // Determine dominant categories (highest scoring modules)
    const sortedModules = Object.entries(moduleScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    const assessmentResult: AssessmentResult = {
      coreScore,
      moduleScores,
      totalScore,
      maxScore,
      percentage,
      stressLevel,
      dominantCategories: sortedModules,
      completedAt: new Date().toISOString(),
    };

    setResult(assessmentResult);
    setStage('results');
  };

  const handleRetake = () => {
    setStage('hero');
    setCurrentQuestionIndex(0);
    setCoreResponses([]);
    setModuleResponses([]);
    setActiveModules([]);
    setCurrentModuleIndex(0);
    setCurrentModuleQuestionIndex(0);
    setResult(null);
    setUserInfo({ name: '', email: '', age: '' });
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    import('@/lib/pdfGenerator').then(({ generatePDFReport }) => {
      generatePDFReport(result, coreResponses, moduleResponses);
    });
  };

  const handleExportData = () => {
    if (!result) return;

    const csvData = [
      ['User Info', userInfo.name, userInfo.email, userInfo.age],
      ['Question ID', 'Question', 'Rating'],
      ...CORE_QUESTIONS.map(q => {
        const response = coreResponses.find(r => r.questionId === q.id);
        return [q.id, q.text, response?.rating?.toString() || ''];
      }),
      ...activeModules.flatMap(module =>
        module.questions.map(q => {
          const response = moduleResponses.find(r => r.questionId === q.id);
          return [q.id, q.text, response?.rating?.toString() || ''];
        })
      ),
      [],
      ['Results Summary'],
      ['Core Score', result.coreScore.toString()],
      ...Object.entries(result.moduleScores).map(([name, score]) => [name, score.toString()]),
      ['Total Score', result.totalScore.toString()],
      ['Max Score', result.maxScore.toString()],
      ['Percentage', `${result.percentage.toFixed(1)}%`],
      ['Stress Level', result.stressLevel],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stress-assessment-${userInfo.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Update background gradient based on stage
  useEffect(() => {
    if (stage === 'hero' || stage === 'onboarding') {
      setBackgroundGradient('from-indigo-950 via-purple-950 to-slate-950');
    } else if (stage === 'core') {
      const hue = (currentQuestionIndex / CORE_QUESTIONS.length) * 30 + 260; // Deeper, more aesthetic range
      setBackgroundGradient(`from-[hsl(${hue},40%,12%)] via-[hsl(${hue + 15},35%,15%)] to-[hsl(${hue + 30},40%,12%)]`);
    } else if (stage === 'module-intro' || stage === 'module') {
      const module = activeModules[currentModuleIndex];
      if (module.id === 'academic') {
        setBackgroundGradient('from-violet-950 via-indigo-950 to-blue-950');
      } else if (module.id === 'social') {
        setBackgroundGradient('from-rose-950 via-pink-950 to-purple-950');
      } else if (module.id === 'financial') {
        setBackgroundGradient('from-amber-950 via-orange-950 to-yellow-950');
      } else if (module.id === 'health') {
        setBackgroundGradient('from-emerald-950 via-teal-950 to-cyan-950');
      }
    } else if (stage === 'results') {
      setBackgroundGradient('from-slate-950 via-purple-950 to-slate-950');
    }
  }, [stage, currentQuestionIndex, currentModuleIndex, activeModules]);

  const getCurrentResponse = () => {
    if (stage === 'core') {
      const questionId = CORE_QUESTIONS[currentQuestionIndex].id;
      return coreResponses.find(r => r.questionId === questionId)?.rating ?? null;
    } else if (stage === 'module') {
      const module = activeModules[currentModuleIndex];
      const questionId = module.questions[currentModuleQuestionIndex].id;
      return moduleResponses.find(r => r.questionId === questionId)?.rating ?? null;
    }
    return null;
  };

  const getTotalProgress = () => {
    const coreTotal = CORE_QUESTIONS.length;
    const moduleTotal = activeModules.reduce((sum, m) => sum + m.questions.length, 0);
    const total = coreTotal + moduleTotal;
    
    let completed = coreResponses.length;
    if (stage === 'module' || stage === 'module-intro' || stage === 'results') {
      completed = coreTotal;
      
      for (let i = 0; i < currentModuleIndex; i++) {
        completed += activeModules[i].questions.length;
      }
      
      if (stage === 'module') {
        completed += moduleResponses.filter(r =>
          activeModules[currentModuleIndex].questions.some(q => q.id === r.questionId)
        ).length;
      }
    }

    return { completed, total };
  };

  const progress = getTotalProgress();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        animate={{ opacity: 1 }}
        className={`fixed inset-0 bg-gradient-to-br ${backgroundGradient} transition-all duration-1000`}
      />

      {/* Particle Background */}
      <ParticleBackground />

      {/* Progress Bar (except hero and results) */}
      {(stage === 'core' || stage === 'module' || stage === 'module-intro') && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <ProgressBar current={progress.completed} total={progress.total} />
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {stage === 'hero' && (
          <motion.div key="hero" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>
            <Hero onStart={handleStart} />
          </motion.div>
        )}

        {stage === 'onboarding' && (
          <motion.div 
            key="onboarding" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex items-center justify-center px-4 py-24 relative z-10"
          >
            <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-2 text-center">Welcome</h2>
              <p className="text-white/60 text-center mb-8">Please tell us a bit about yourself before we begin.</p>
              <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">Age</label>
                  <input
                    required
                    type="number"
                    min="15"
                    max="100"
                    value={userInfo.age}
                    onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="e.g. 20"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all mt-4"
                >
                  Continue to Assessment
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {stage === 'core' && (
          <motion.div key={`core-${currentQuestionIndex}`} className="min-h-screen flex items-center justify-center py-24">
            <QuestionCard
              question={CORE_QUESTIONS[currentQuestionIndex].text}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={CORE_QUESTIONS.length}
              value={getCurrentResponse()}
              onChange={handleCoreResponse}
              onNext={handleCoreNext}
              isLastQuestion={currentQuestionIndex === CORE_QUESTIONS.length - 1}
              testId={`text-core-question-${currentQuestionIndex + 1}`}
            />
          </motion.div>
        )}

        {stage === 'module-intro' && (
          <motion.div key={`module-intro-${currentModuleIndex}`}>
            <ModuleHeader
              moduleName={activeModules[currentModuleIndex].name}
              moduleNumber={currentModuleIndex + 1}
              totalModules={activeModules.length}
              gradient={activeModules[currentModuleIndex].theme.gradient}
            />
            <div className="flex justify-center pb-20">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => setStage('module')}
                data-testid="button-start-module"
                className="px-10 py-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md text-white font-heading font-semibold text-lg rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                Begin Module
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'module' && (
          <motion.div key={`module-${currentModuleIndex}-${currentModuleQuestionIndex}`} className="min-h-screen flex items-center justify-center py-24">
            <QuestionCard
              question={activeModules[currentModuleIndex].questions[currentModuleQuestionIndex].text}
              questionNumber={currentModuleQuestionIndex + 1}
              totalQuestions={activeModules[currentModuleIndex].questions.length}
              value={getCurrentResponse()}
              onChange={handleModuleResponse}
              onNext={handleModuleNext}
              isLastQuestion={
                currentModuleQuestionIndex === activeModules[currentModuleIndex].questions.length - 1 &&
                currentModuleIndex === activeModules.length - 1
              }
              testId={`text-module-question-${currentModuleQuestionIndex + 1}`}
            />
          </motion.div>
        )}

        {stage === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <ResultsDashboard
              result={result}
              onRetake={handleRetake}
              onDownloadPDF={handleDownloadPDF}
              onExportData={handleExportData}
            />
            
            {/* Credits Footer */}
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-center pb-12 text-white/50 text-sm"
              data-testid="footer-credits"
            >
              <p>Developed by Group 10</p>
              <p className="mt-1">Workplace Stress Resilience Prediction Project</p>
              <p className="mt-1">Techno Main Salt Lake</p>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
