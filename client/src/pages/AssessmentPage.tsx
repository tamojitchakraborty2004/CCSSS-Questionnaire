import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { ParticleBackground } from '@/components/ParticleBackground';
import { QuestionCard } from '@/components/QuestionCard';
import { ModuleHeader } from '@/components/ModuleHeader';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ProgressBar } from '@/components/ProgressBar';
import { CORE_QUESTIONS, MODULES, type AssessmentResult, type Response } from '@shared/schema';

import { apiRequest } from '@/lib/queryClient';

type Stage = 'hero' | 'onboarding' | 'core' | 'module-intro' | 'module' | 'results' | 'duplicate';

export default function AssessmentPage() {
  const [stage, setStage] = useState<Stage>('hero');
  const [duplicateReason, setDuplicateReason] = useState('');
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [userInfo, setUserInfo] = useState({ name: '', email: '', age: '', studentId: '' });
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

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.age || !userInfo.studentId) return;

    setCheckingDuplicate(true);
    setOnboardingError('');

    try {
      const res = await fetch('/api/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userInfo.email, studentId: userInfo.studentId }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setOnboardingError(`This ${data.reason} has already been used to submit an assessment. Only one submission is allowed per student.`);
        setCheckingDuplicate(false);
        return;
      }
    } catch {
      // If check fails, allow them through (server will catch on final submit)
    }

    setCheckingDuplicate(false);
    setStage('core');
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
      const coreScore = coreResponses.reduce((sum, r) => sum + r.rating, 0);
      const modules: typeof MODULES = [];

      const heavyWorkload = coreResponses.find(r => r.questionId === 'c1')?.rating || 0;
      const pressureGrades = coreResponses.find(r => r.questionId === 'c2')?.rating || 0;
      const poorSleep = coreResponses.find(r => r.questionId === 'c3')?.rating || 0;
      const financial = coreResponses.find(r => r.questionId === 'c4')?.rating || 0;

      if (heavyWorkload >= 2 && pressureGrades >= 2) {
        modules.push(MODULES.find(m => m.id === 'academic')!);
      }
      if (poorSleep >= 2) {
        modules.push(MODULES.find(m => m.id === 'health')!);
      }
      if (financial >= 2) {
        modules.push(MODULES.find(m => m.id === 'financial')!);
      }
      modules.push(MODULES.find(m => m.id === 'social')!);

      setActiveModules(modules);

      if (coreScore > 13 && modules.length > 0) {
        setCurrentModuleIndex(0);
        setCurrentModuleQuestionIndex(0);
        setStage('module-intro');
      } else {
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
      if (currentModuleIndex < activeModules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
        setCurrentModuleQuestionIndex(0);
        setStage('module-intro');
      } else {
        calculateResults(moduleResponses);
      }
    }
  };

  const calculateResults = async (finalModuleResponses: Response[]) => {
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
    const percentage = Math.round((totalScore / maxScore) * 100);

    let stressLevel: 'Low' | 'Moderate' | 'High';
    if (percentage <= 33) stressLevel = 'Low';
    else if (percentage <= 66) stressLevel = 'Moderate';
    else stressLevel = 'High';

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

    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userInfo.studentId,
          name: userInfo.name,
          email: userInfo.email,
          age: parseInt(userInfo.age),
          coreScore,
          moduleScores,
          totalScore,
          maxScore,
          percentage,
          stressLevel,
          dominantCategories: sortedModules,
          coreResponses,
          moduleResponses: finalModuleResponses,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicateReason(data.reason || 'email address or student ID');
        setStage('duplicate');
        return;
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }

    setResult(assessmentResult);
    setStage('results');
  };

  const handleRetake = () => {
    setStage('hero');
    setDuplicateReason('');
    setOnboardingError('');
    setCurrentQuestionIndex(0);
    setCoreResponses([]);
    setModuleResponses([]);
    setActiveModules([]);
    setCurrentModuleIndex(0);
    setCurrentModuleQuestionIndex(0);
    setResult(null);
    setUserInfo({ name: '', email: '', age: '', studentId: '' });
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
      ['Student ID', userInfo.studentId],
      ['Name', userInfo.name],
      ['Email', userInfo.email],
      ['Age', userInfo.age],
      [],
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
      ['Percentage', `${result.percentage}%`],
      ['Stress Level', result.stressLevel],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stress-assessment-${userInfo.studentId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (stage === 'hero' || stage === 'onboarding') {
      setBackgroundGradient('from-slate-950 via-indigo-950 to-slate-950');
    } else if (stage === 'core') {
      const coreGradients = [
        'from-indigo-950 via-slate-950 to-purple-950',
        'from-indigo-950 via-slate-950 to-purple-950',
        'from-slate-950 via-indigo-950 to-violet-950',
        'from-slate-950 via-indigo-950 to-violet-950',
        'from-violet-950 via-slate-950 to-indigo-950',
        'from-violet-950 via-slate-950 to-indigo-950',
        'from-purple-950 via-indigo-950 to-slate-950',
        'from-purple-950 via-indigo-950 to-slate-950',
        'from-indigo-950 via-purple-950 to-slate-950',
        'from-indigo-950 via-purple-950 to-slate-950',
      ];
      setBackgroundGradient(coreGradients[currentQuestionIndex] || 'from-indigo-950 via-slate-950 to-purple-950');
    } else if (stage === 'module-intro' || stage === 'module') {
      const module = activeModules[currentModuleIndex];
      if (module.id === 'academic') setBackgroundGradient('from-violet-950 via-indigo-950 to-blue-950');
      else if (module.id === 'social') setBackgroundGradient('from-rose-950 via-pink-950 to-purple-950');
      else if (module.id === 'financial') setBackgroundGradient('from-amber-950 via-orange-950 to-yellow-950');
      else if (module.id === 'health') setBackgroundGradient('from-emerald-950 via-teal-950 to-cyan-950');
    } else if (stage === 'results' || stage === 'duplicate') {
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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        animate={{ opacity: 1 }}
        className={`fixed inset-0 bg-gradient-to-br ${backgroundGradient} transition-all duration-1000`}
      />

      <ParticleBackground />

      {(stage === 'core' || stage === 'module' || stage === 'module-intro') && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <ProgressBar current={progress.completed} total={progress.total} />
        </div>
      )}

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
              <p className="text-white/60 text-center mb-8">Tell us about yourself before we begin.</p>
              <form onSubmit={handleOnboardingSubmit} className="space-y-5">

                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">
                    Roll Number
                    <span className="ml-2 text-indigo-400 text-xs">(required for research)</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={userInfo.studentId}
                    onChange={e => setUserInfo({ ...userInfo, studentId: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 13000122037"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={userInfo.name}
                    onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-heading mb-2 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={userInfo.email}
                    onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                    className={inputClass}
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
                    onChange={e => setUserInfo({ ...userInfo, age: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 20"
                  />
                </div>

                <p className="text-white/30 text-xs text-center pt-1">
                  Your data will only be used for academic research purposes.
                </p>

                {onboardingError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-5 py-4"
                  >
                    <svg className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                    </svg>
                    <p className="text-rose-300 text-sm leading-relaxed">{onboardingError}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: checkingDuplicate ? 1 : 1.02 }}
                  whileTap={{ scale: checkingDuplicate ? 1 : 0.98 }}
                  type="submit"
                  disabled={checkingDuplicate}
                  className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-heading font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {checkingDuplicate ? 'Checking...' : 'Continue to Assessment →'}
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
          <motion.div
            key={`module-intro-${currentModuleIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10"
          >
            <ModuleHeader
              moduleName={activeModules[currentModuleIndex].name}
              moduleNumber={currentModuleIndex + 1}
              totalModules={activeModules.length}
              gradient={activeModules[currentModuleIndex].theme.gradient}
            />
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setStage('module')}
              data-testid="button-start-module"
              className="mt-8 px-12 py-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md text-white font-heading font-semibold text-lg rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              Begin Module
            </motion.button>
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

        {stage === 'duplicate' && (
          <motion.div
            key="duplicate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center px-4 relative z-10"
          >
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white font-heading mb-3">Already Submitted</h2>
              <p className="text-white/60 leading-relaxed">
                An assessment has already been submitted using this <span className="text-rose-400 font-semibold">{duplicateReason}</span>.
                Only one submission is allowed per student.
              </p>
              <p className="text-white/40 text-sm mt-4">
                If you believe this is an error, please contact your research coordinator.
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}