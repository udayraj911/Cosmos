import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Sparkles, Brain, CheckCircle, AlertCircle, 
  RotateCcw, Info, BookOpen, Atom, Percent, Flame
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../quizData';
import { UserStats } from '../types';
import { playSynthBeep, playSuccessChime, playErrorBuzz } from '../utils/audio';

interface KnowledgeQuestProps {
  onClose: () => void;
}

export const KnowledgeQuest: React.FC<KnowledgeQuestProps> = ({ onClose }) => {
  // Load stats persistently from localStorage
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('knowledgeQuest_stats');
      return saved ? JSON.parse(saved) : { xp: 0, answerHistory: {} };
    } catch (e) {
      return { xp: 0, answerHistory: {} };
    }
  });

  // Selected tab toggle: 'normal' for Standard Quiz, 'advanced' for Advanced Knowledge (quantum mechanics, subconscious)
  const [selectedCategory, setSelectedCategory] = useState<'normal' | 'advanced'>('normal');

  // Maintain separate question indexes for Standard and Advanced routes
  const [normalIdx, setNormalIdx] = useState<number>(0);
  const [advancedIdx, setAdvancedIdx] = useState<number>(0);

  const activeIdx = selectedCategory === 'normal' ? normalIdx : advancedIdx;
  const setActiveIdx = selectedCategory === 'normal' ? setNormalIdx : setAdvancedIdx;

  // Answer states for the active question
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswersLocked, setIsAnswersLocked] = useState<boolean>(false);
  const [wrongAnswerIndex, setWrongAnswerIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Filter 50 questions per active sector
  const questionsInSector = QUIZ_QUESTIONS.filter(q => q.category === selectedCategory);
  const activeQuestion = questionsInSector[activeIdx];

  // Save stats persistently on change
  useEffect(() => {
    localStorage.setItem('knowledgeQuest_stats', JSON.stringify(stats));
  }, [stats]);

  // Sync state whenever the question index or selected category changes
  useEffect(() => {
    if (activeQuestion) {
      // Check if user has already answered this question in history
      const savedState = localStorage.getItem(`kq_answer_${activeQuestion.id}`);
      if (savedState) {
        const { selectedIndex, isCorrect, wrongIdx } = JSON.parse(savedState);
        setSelectedAnswer(selectedIndex);
        setIsAnswersLocked(true);
        setWrongAnswerIndex(wrongIdx !== undefined ? wrongIdx : null);
      } else {
        setSelectedAnswer(null);
        setIsAnswersLocked(false);
        setWrongAnswerIndex(null);
      }
    }
  }, [activeIdx, selectedCategory, activeQuestion]);

  // Compute metrics for progress display
  const totalQuestions = 100;
  const answeredHistoryMap = stats.answerHistory || {};
  const answeredCount = Object.keys(answeredHistoryMap).length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  // Compute correct answers for active category to display stats
  const categoryQuestions = QUIZ_QUESTIONS.filter(q => q.category === selectedCategory);
  const categoryIds = categoryQuestions.map(q => q.id);
  const correctInCurrentCategory = categoryIds.filter(id => answeredHistoryMap[id] === true).length;
  const solvedInCurrentCategory = categoryIds.filter(id => answeredHistoryMap[id] !== undefined).length;

  const handleAnswerSubmit = (optionIndex: number) => {
    if (isAnswersLocked || !activeQuestion) return;

    const isCorrect = optionIndex === activeQuestion.answerIndex;
    setSelectedAnswer(optionIndex);
    setIsAnswersLocked(true);

    let xpGain = 0;
    if (isCorrect) {
      playSuccessChime();
      xpGain = 100; // Normal questions reward 100 XP
      if (selectedCategory === 'advanced') {
        xpGain = 150; // Advanced questions reward 150 XP
      }

      setStats(prev => ({
        ...prev,
        xp: prev.xp + xpGain,
        answerHistory: { ...prev.answerHistory, [activeQuestion.id]: true }
      }));

      setToastMessage({ text: `CORRECT QUANTUM LINKAGE! +${xpGain} XP`, isCorrect: true });
      
      // Save full feedback configuration for resume
      localStorage.setItem(`kq_answer_${activeQuestion.id}`, JSON.stringify({
        selectedIndex: optionIndex,
        isCorrect: true,
        wrongIdx: null
      }));
    } else {
      playErrorBuzz();
      setWrongAnswerIndex(optionIndex);
      
      setStats(prev => ({
        ...prev,
        answerHistory: { ...prev.answerHistory, [activeQuestion.id]: false }
      }));

      setToastMessage({ text: 'TELEMETRY RE-ROUTE INITIATED. INCORRECT CONNOTATION.', isCorrect: false });
      
      localStorage.setItem(`kq_answer_${activeQuestion.id}`, JSON.stringify({
        selectedIndex: activeQuestion.answerIndex,
        isCorrect: false,
        wrongIdx: optionIndex
      }));
    }

    playSynthBeep(isCorrect ? 880 : 330, 0.15, 'sawtooth');

    // Dismiss toast message automatically
    setTimeout(() => {
      setToastMessage(null);
    }, 2805);
  };

  const handleNextQuest = () => {
    if (activeIdx < questionsInSector.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else {
      // Cyclic rotation
      setActiveIdx(0);
    }
    playSynthBeep(600, 0.08, 'triangle');
  };

  const handleResetKq = () => {
    if (window.confirm("Are you sure you want to completely clear your telemetry logs, XP metrics, and answer histories?")) {
      playSynthBeep(200, 0.3, 'sawtooth');
      
      // Clear specific question choices
      QUIZ_QUESTIONS.forEach(q => {
        localStorage.removeItem(`kq_answer_${q.id}`);
      });

      // Clear main stats
      const emptyStats = { xp: 0, answerHistory: {} };
      setStats(emptyStats);
      localStorage.setItem('knowledgeQuest_stats', JSON.stringify(emptyStats));
      
      setNormalIdx(0);
      setAdvancedIdx(0);
      setSelectedCategory('normal');
      setIsAnswersLocked(false);
      setSelectedAnswer(null);
      setWrongAnswerIndex(null);
    }
  };

  // Get active user military/academic rank from XP
  const getRankStats = (xp: number) => {
    if (xp >= 8000) return { title: 'Cosmic Overlord', color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/20' };
    if (xp >= 5500) return { title: 'Quantum Sage', color: 'text-purple-400 border-purple-500/40 bg-purple-950/20' };
    if (xp >= 3000) return { title: 'Fleet Admiral', color: 'text-orange-400 border-orange-500/40 bg-orange-950/20' };
    if (xp >= 1500) return { title: 'Astrophysicist', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20' };
    if (xp >= 500) return { title: 'Space Cadet', color: 'text-teal-400 border-teal-500/40 bg-teal-950/20' };
    return { title: 'Initiate Scout', color: 'text-slate-400 border-slate-500/40 bg-slate-900/40' };
  };

  const activeRank = getRankStats(stats.xp);

  return (
    <div className="w-full h-full flex flex-col gap-4 text-white overflow-hidden select-none relative p-1 md:p-3" id="kq-container-portal">
      
      {/* 1. PERSISTENT FLOATING METRICS HUD BAR */}
      <div className="glass-panel border-purple-500/10 rounded-2xl p-4 bg-slate-950/70 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 border" id="kq-hud-persistent">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-yellow-500/20 bg-yellow-500/5 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">ACCUMULATED FIELD SCORE</div>
            <div className="text-lg font-display font-black text-white leading-none flex items-center gap-2">
              <span>{stats.xp} XP</span>
              <span className={`text-[8.5px] px-2 py-0.5 rounded-full border ${activeRank.color} font-mono uppercase tracking-wider font-bold`}>
                {activeRank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic 100-Question progress tracking */}
        <div className="flex-grow max-w-md w-full">
          <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400 uppercase mb-1">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-cyan-400" />
              Progress Rate: {completionPercentage}% Completed
            </span>
            <span>{answeredCount} / 100 Questions Solved</span>
          </div>
          
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Clear Telemetry Action */}
        <button 
          onClick={handleResetKq}
          className="text-slate-500 hover:text-red-400 hover:border-red-500/30 font-mono text-[8px] uppercase tracking-widest border border-white/5 bg-white/2 py-2 px-3.5 rounded-lg transition-all duration-200"
          title="Reset All Knowledge Quest History"
        >
          RESET MIND DATA
        </button>
      </div>

      {/* 2. DOCKET TABS & CONDITIONAL VIEW SWITCHER */}
      <div className="grid grid-cols-2 gap-3 mb-1" id="kq-view-toggle">
        <button
          onClick={() => {
            setSelectedCategory('normal');
            playSynthBeep(520, 0.08, 'sine');
          }}
          className={`py-3 px-4 text-xs font-display font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${
            selectedCategory === 'normal'
              ? 'bg-gradient-to-r from-teal-500/10 to-teal-500/20 text-teal-400 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.15)]Scale-[1.01]'
              : 'text-slate-450 bg-slate-950/40 border-white/5 hover:text-white hover:bg-slate-900 hover:border-white/10'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${selectedCategory === 'normal' ? 'animate-bounce' : ''}`} />
          Standard Quiz
        </button>

        <button
          onClick={() => {
            setSelectedCategory('advanced');
            playSynthBeep(660, 0.08, 'sine');
          }}
          className={`py-3 px-4 text-xs font-display font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${
            selectedCategory === 'advanced'
              ? 'bg-gradient-to-r from-purple-500/10 to-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
              : 'text-slate-450 bg-slate-950/40 border-white/5 hover:text-white hover:bg-slate-900 hover:border-white/10'
          }`}
        >
          <Atom className={`w-4 h-4 ${selectedCategory === 'advanced' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          Advanced Knowledge
        </button>
      </div>

      {/* 3. WORKING LAYOUT: QUESTION AREA & SECTOR GRID OVERLAY */}
      <div className="w-full flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden" id="kq-working-portal">
        
        {/* LEFT AREA: Active Question Display Panel */}
        <div className="flex-grow lg:w-[63%] glass-panel border border-slate-800/60 rounded-2xl p-5 md:p-6 bg-slate-950/75 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-full">
          <div>
            {/* Sector Header Information */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-display font-black tracking-widest uppercase">
                  SECTOR QUEST: {activeIdx + 1} / {questionsInSector.length}
                </span>
              </div>
              
              <span className="text-[7.5px] font-mono uppercase bg-slate-800/70 border border-white/5 text-slate-400 tracking-widest px-2.5 py-1 rounded-full">
                {selectedCategory === 'advanced' ? 'QUANTUM & SUBCONSCIOUS MIND' : 'COSMIC FUNDAMENTALS'}
              </span>
            </div>

            {/* Question Text */}
            {activeQuestion ? (
              <div className="animate-fadeUp">
                <span className="text-[8px] font-mono text-purple bg-purple/10 border border-purple/20 tracking-widest uppercase px-2 py-0.5 rounded mb-3 inline-block">
                  {selectedCategory === 'advanced' 
                    ? (activeQuestion.id <= 67 ? 'QUANTUM PHYSICS' : activeQuestion.id <= 84 ? 'HYPERDIMENSIONAL SPACE' : 'PSYCHOLOGY & SUBCONSCIOUS PERCEPTION')
                    : 'ASTRONOMICAL SCIENCE'
                  }
                </span>
                <h3 className="font-display font-black text-sm md:text-base text-cream leading-relaxed uppercase tracking-wide tracking-tight select-none mb-6">
                  {activeQuestion.question}
                </h3>

                {/* Option Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQuestion.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrectChoice = i === activeQuestion.answerIndex;
                    const isWrongChoice = wrongAnswerIndex === i;

                    let btnStyle = 'border-white/5 bg-slate-900/40 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-900/80 hover:text-white';
                    if (isAnswersLocked) {
                      if (isCorrectChoice) {
                        btnStyle = 'border-teal-400 bg-teal-950/40 text-teal-300 font-extrabold shadow-[0_0_15px_rgba(45,212,191,0.2)]';
                      } else if (isWrongChoice) {
                        btnStyle = 'border-red-400 bg-red-950/40 text-red-300 font-bold';
                      } else {
                        btnStyle = 'border-white/5 bg-slate-950/70 text-slate-600 opacity-50 cursor-not-allowed';
                      }
                    } else if (isSelected) {
                      btnStyle = 'border-cyan-500 bg-cyan-950/50 text-white';
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswersLocked}
                        onClick={() => handleAnswerSubmit(i)}
                        className={`text-left p-4 rounded-xl border text-[11px] font-sans transition-all duration-300 flex items-center justify-between cursor-none hover:scale-[1.005] select-none text-wrap ${btnStyle}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-[10px] font-mono text-slate-500">{i + 1}.</span>
                          <span>{opt}</span>
                        </div>
                        {isAnswersLocked && isCorrectChoice && <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />}
                        {isAnswersLocked && isWrongChoice && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-slate-400 font-mono text-xs uppercase leading-loose">
                ERROR: QUIZ TELEMETRY STREAM DISCONNECTED. RE-LINKING...
              </div>
            )}
          </div>

          {/* Feedback Explanation of Answer */}
          {isAnswersLocked && activeQuestion && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-6 pt-4 border-t border-white/5 text-[10px] md:text-[11px] text-slate-300 leading-relaxed flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
            >
              <div className="flex items-start gap-2 max-w-[80%]">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-white uppercase mr-1">
                    {wrongAnswerIndex === null ? '✓ STABLE CONNECTION. ' : '✗ WAVE COLLAPSE. '}
                  </span>
                  {activeQuestion.explanation}
                </p>
              </div>

              <button
                onClick={handleNextQuest}
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-500/40 border border-purple-500/60 hover:border-white text-[10px] font-display font-medium uppercase tracking-wider rounded-xl cursor-none transition-all ml-auto block select-none whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              >
                NEXT STAGE →
              </button>
            </motion.div>
          )}
        </div>

        {/* RIGHT AREA: Sector Matrix Navigator */}
        <div className="w-full lg:w-[37%] glass-panel border border-slate-800/40 rounded-2xl p-4 bg-slate-950/60 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase mb-1">LOCAL COGNITIVE MATRIX</div>
            <h4 className="font-display font-bold text-[10.5px] text-teal-400 tracking-widest uppercase border-b border-white/5 pb-2 mb-3 flex justify-between items-center">
              <span>SECTORS: {correctInCurrentCategory} / {questionsInSector.length} RESOLVED</span>
              <span className="text-[9px] text-slate-400 font-mono normal-case">
                {solvedInCurrentCategory} / 50 Solved
              </span>
            </h4>

            {/* Grid of 50 Sector Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-10 lg:grid-cols-5 xl:grid-cols-10 gap-1.5 max-h-[185px] md:max-h-[220px] overflow-y-auto pr-1">
              {questionsInSector.map((q, idx) => {
                const answerStatus = answeredHistoryMap[q.id];
                const isActive = activeIdx === idx;

                let gridStyle = 'border-white/5 text-slate-550 bg-slate-900/10';
                if (isActive) {
                  gridStyle = 'border-cyan-400 text-white bg-cyan-950/40 animate-pulse font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]';
                } else if (answerStatus === true) {
                  gridStyle = 'border-teal-500/30 text-teal-400 bg-teal-950/15';
                } else if (answerStatus === false) {
                  gridStyle = 'border-red-500/30 text-red-400 bg-red-950/15';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveIdx(idx);
                      playSynthBeep(450, 0.05, 'sine');
                    }}
                    title={`Sector ${q.id}: ${q.question}`}
                    className={`p-2 text-[9px] font-mono rounded-lg border flex items-center justify-center transition-all duration-300 hover:border-cyan-500 hover:scale-105 cursor-none font-bold ${gridStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2.5">
            <p className="text-[7.5px] font-mono leading-relaxed text-slate-500 italic">
              ✦ Highlighted nodes match active telemetry. Green nodes represent successful calculations, gray coordinates indicate pending missions. Click any sector node above to bypass structural sequence.
            </p>

            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-[9.5px] font-display font-medium uppercase tracking-widest rounded-xl transition-all block text-center cursor-none w-full shadow-md"
            >
              ← RETURN TO MASTER WORKSPACE
            </button>
          </div>
        </div>

      </div>

      {/* 4. FLOATING FEEDBACK TOAST FEED */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className={`fixed bottom-6 right-6 p-4 rounded-xl border font-display text-[9.5px] tracking-widest uppercase select-none z-[1100] flex items-center gap-2.5 shadow-xl ${
              toastMessage.isCorrect 
                ? 'bg-teal-900/20 border-teal text-teal shadow-[0_0_20px_rgba(20,184,166,0.3)]' 
                : 'bg-red-900/20 border-red text-red shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            {toastMessage.isCorrect ? (
              <CheckCircle className="w-4 h-4 text-teal animate-bounce" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red animate-ping" />
            )}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
