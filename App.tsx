
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COURSES } from './constants';
import { Course, Lesson, UserProfile, Language, LessonTheme } from './types';
import { gemini } from './services/geminiService';
import { storageService } from './services/storageService';
import { translations } from './translations';
import AudioButton from './components/AudioButton';
import EmailSignIn from './components/EmailSignIn';
import OnboardingQuiz from './components/OnboardingQuiz';
import LearningPath from './components/LearningPath';
import LanguageSwitcher from './components/LanguageSwitcher';
import ChatBot from './components/ChatBot';
import CalendarModule from './components/CalendarModule';
import StreakBadge from './components/StreakBadge';
import RewardModal from './components/RewardModal';
import { applyLessonRewards, LessonResult } from './services/progressService';

const ColorfulLogo = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-24 h-24 text-5xl"
  };
  return (
    <div className={`${sizes[size]} ${className} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[28%] flex items-center justify-center text-white font-black shadow-2xl transform transition-transform hover:rotate-3 cursor-pointer ring-4 ring-white/20`}>
      S
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'onboarding' | 'generating' | 'pathway' | 'lesson' | 'chatbot' | 'calendar'>('landing');
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(COURSES[0].lessons[0]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('smarty_language') as Language) || 'en');
  const [globalCount, setGlobalCount] = useState<number>(() => storageService.getGlobalStudentCount());
  
  // Lesson/Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Gamification state
  const [rewardOpen, setRewardOpen] = useState(false);
  const [lastRewards, setLastRewards] = useState<{ xpGained: number; coinsGained: number; streakDelta: number } | null>(null);
  const [lessonStartTime, setLessonStartTime] = useState<number | null>(null);

  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    const activeAccount = storageService.getActiveAccount();
    if (activeAccount) {
      const savedUser = storageService.getUserByAccount(activeAccount);
      if (savedUser) {
        setUser(savedUser);
        setLanguage(savedUser.language || 'en');
        setCompletedLessons(new Set(storageService.getProgress(activeAccount)));
        setView(savedUser.onboarded ? 'pathway' : 'onboarding');
      }
    }
  }, []);

  const themeClasses = useMemo(() => {
    const theme: LessonTheme = user?.theme || 'minimal';
    const baseThemes = {
      cyberpunk: {
        bg: 'bg-slate-950 text-cyan-400',
        card: 'bg-slate-900/90 border-cyan-500/30 text-white shadow-[0_0_60px_rgba(6,182,212,0.15)] rounded-[48px] backdrop-blur-2xl',
        prose: 'prose-invert prose-cyan',
        accent: 'text-cyan-400',
        button: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40 rounded-2xl',
        nav: 'bg-slate-900/95 border-cyan-900/50 text-cyan-400',
        writingBox: 'bg-slate-900 text-white border-cyan-500/50',
        secondary: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        quizOption: 'bg-slate-800 border-cyan-500/30 hover:bg-slate-700',
        quizCorrect: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
        quizWrong: 'bg-rose-500/20 border-rose-500 text-rose-400'
      },
      academic: {
        bg: 'bg-[#f9f7f2] text-[#2c3e50]',
        card: 'bg-white border-[#e0d9c8] shadow-sm rounded-none border-t-[8px] border-t-[#2c3e50] p-16',
        prose: 'prose-slate font-serif',
        accent: 'text-[#2c3e50]',
        button: 'bg-[#2c3e50] hover:bg-[#34495e] rounded-none',
        nav: 'bg-white border-slate-200 text-slate-800',
        writingBox: 'bg-slate-100 text-[#2c3e50] border-slate-300',
        secondary: 'bg-slate-100 text-slate-600 border-slate-200',
        quizOption: 'bg-white border-slate-200 hover:bg-slate-50',
        quizCorrect: 'bg-emerald-50 border-emerald-500 text-emerald-700',
        quizWrong: 'bg-rose-50 border-rose-500 text-rose-700'
      },
      playful: {
        bg: 'bg-yellow-50 text-indigo-900',
        card: 'bg-white border-yellow-200 border-b-[12px] border-b-yellow-400 shadow-2xl rounded-[60px]',
        prose: 'prose-indigo',
        accent: 'text-pink-500',
        button: 'bg-pink-500 hover:bg-pink-400 rounded-full shadow-pink-200',
        nav: 'bg-white/95 border-yellow-100 text-indigo-900',
        writingBox: 'bg-slate-900 text-white border-slate-700',
        secondary: 'bg-pink-50 text-pink-600 border-pink-100',
        quizOption: 'bg-white border-pink-100 hover:bg-pink-50',
        quizCorrect: 'bg-emerald-100 border-emerald-500 text-emerald-700',
        quizWrong: 'bg-rose-100 border-rose-500 text-rose-700'
      },
      minimal: {
        bg: 'bg-white text-slate-900',
        card: 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40 rounded-[48px]',
        prose: 'prose-slate',
        accent: 'text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100 rounded-3xl',
        nav: 'bg-white/95 border-slate-100 text-slate-900',
        writingBox: 'bg-slate-900 text-white border-slate-700',
        secondary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        quizOption: 'bg-white border-slate-200 hover:bg-slate-50',
        quizCorrect: 'bg-emerald-50 border-emerald-500 text-emerald-700',
        quizWrong: 'bg-rose-50 border-rose-500 text-rose-700'
      }
    };
    return baseThemes[theme] || baseThemes.minimal;
  }, [user?.theme]);

  const handleAuthSuccess = (accountName: string) => {
    const existing = storageService.getUserByAccount(accountName);
    if (existing) {
      setUser(existing);
      setLanguage(existing.language || 'en');
      setCompletedLessons(new Set(storageService.getProgress(accountName)));
      setView(existing.onboarded ? 'pathway' : 'onboarding');
    } else {
      const newUser: UserProfile = {
        email: accountName,
        name: accountName,
        grade: '',
        level: 'beginner',
        interests: [],
        theme: 'minimal',
        onboarded: false,
        language,
        coins: 100,
        streak: 1,
        streakState: {
          streakCount: 1,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          streakFreezeCount: 0,
          longestStreak: 1,
        },
        xpTotal: 0,
        xpThisWeek: 0,
        mentorPersona: 'friendly',
      };
      setUser(newUser);
      storageService.saveUser(newUser);
      setGlobalCount(storageService.getGlobalStudentCount());
      setView('onboarding');
    }
  };

  const handleOnboardingComplete = async (quizData: Omit<UserProfile, 'email' | 'onboarded'>) => {
    if (user) {
      setView('generating');
      const updatedUser: UserProfile = {
        ...user,
        ...quizData,
        onboarded: true,
        coins: user.coins ?? 100,
        streak: user.streakState?.streakCount ?? user.streak ?? 1,
        streakState: user.streakState ?? {
          streakCount: user.streak ?? 1,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          streakFreezeCount: 0,
          longestStreak: user.streak ?? 1,
        },
        xpTotal: user.xpTotal ?? 0,
        xpThisWeek: user.xpThisWeek ?? 0,
        mentorPersona: user.mentorPersona ?? 'friendly',
      };
      const insights = await gemini.generateSmartPathInsights(updatedUser);
      updatedUser.smartInsights = insights;
      setUser(updatedUser);
      storageService.saveUser(updatedUser);
      setTimeout(() => setView('pathway'), 2000);
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    storageService.saveUser(updatedUser);
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizFeedback) return;
    setSelectedAnswer(idx);
    const correct = activeLesson.quiz?.[currentQuizIndex]?.answerIndex === idx;
    setQuizFeedback(correct ? 'correct' : 'wrong');
    
    if (correct) {
      setTimeout(() => {
        if (activeLesson.quiz && currentQuizIndex < activeLesson.quiz.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setQuizFeedback(null);
          setSelectedAnswer(null);
        } else {
          completeLesson();
        }
      }, 800);
    } else {
      setTimeout(() => {
        setQuizFeedback(null);
        setSelectedAnswer(null);
      }, 600);
    }
  };

  const completeLesson = () => {
    if (!user) return;

    const newCompleted = new Set(completedLessons).add(activeLesson.id);
    setCompletedLessons(newCompleted);
    storageService.saveProgress(user.email, Array.from(newCompleted));

    // For now we treat a finished quiz as all-correct and roughly 60s duration.
    const result: LessonResult = {
      correctCount: activeLesson.quiz?.length || 1,
      totalQuestions: activeLesson.quiz?.length || 1,
      durationSeconds: 60,
    };

    const { user: updatedUser, rewards } = applyLessonRewards(user, result);
    setUser(updatedUser);
    storageService.saveUser(updatedUser);

    setLastRewards(rewards);
    setRewardOpen(true);
  };

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('smarty_language', lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      storageService.saveUser(updated);
    }
  }, [user]);

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white animate-in fade-in duration-500 selection:bg-indigo-100">
        <nav className="sticky top-0 z-50 px-6 py-5 glass border-b border-slate-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ColorfulLogo size="sm" />
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase">
                Smarty
              </span>
            </div>
            <div className="flex items-center gap-6">
              <LanguageSwitcher currentLang={language} onLanguageChange={handleLanguageChange} />
              <button onClick={() => setView('auth')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95">
                {t.nav.signIn}
              </button>
            </div>
          </div>
        </nav>

        <section className="px-6 py-32 md:py-48 text-center max-w-6xl mx-auto relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[160px] -z-10 animate-pulse"></div>
          
          <div className="inline-block px-5 py-2 mb-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-[0.25em] animate-in slide-in-from-bottom-4 duration-500">
            {t.landing.tagline}
          </div>
          <h1 className="text-7xl md:text-[120px] font-black text-slate-900 mb-12 tracking-tighter leading-[0.85] animate-in slide-in-from-bottom-4 duration-700 uppercase whitespace-pre-line">
            THINK <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">BIGGER</span>{"\n"}LEARN AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 leading-relaxed mb-16 max-w-3xl mx-auto font-medium opacity-90 animate-in slide-in-from-bottom-8 duration-700">
            {t.landing.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-in slide-in-from-bottom-8 duration-1000">
            <button onClick={() => setView('auth')} className="w-full sm:w-auto px-16 py-7 bg-indigo-600 text-white rounded-[40px] font-black text-3xl hover:bg-indigo-700 transition-all shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] hover:-translate-y-2 active:scale-95">
              {t.landing.cta}
            </button>
            <div className="flex items-center gap-5 bg-white p-3 pr-8 rounded-full border border-slate-100 shadow-xl shadow-slate-200/30">
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=smarty-${i+10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <span className="block text-lg font-black text-slate-900 leading-none tabular-nums animate-in fade-in duration-1000">
                  {globalCount.toLocaleString()}+
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.landing.students}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-50">
          {COURSES.map((course, idx) => (
            <div key={course.id} className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all group animate-in fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
              <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center text-4xl mb-10 ${course.color} shadow-lg group-hover:rotate-6 transition-transform`}>
                {course.icon}
              </div>
              <h3 className="text-3xl font-black mb-5 text-slate-900 tracking-tight">{course.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">
                {course.description}
              </p>
            </div>
          ))}
        </section>

        <footer className="py-24 text-center border-t border-slate-100">
            <div className="flex items-center justify-center gap-3 mb-6 opacity-40 grayscale">
                <ColorfulLogo size="sm" />
                <span className="text-xl font-black">Smarty Academy</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Join the frontier of the intelligence revolution. © 2024</p>
        </footer>
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[56px] p-16 shadow-2xl border border-slate-50 text-center animate-in zoom-in">
          <div className="mb-10 flex flex-col items-center">
            <ColorfulLogo size="lg" className="mb-6" />
            <LanguageSwitcher currentLang={language} onLanguageChange={handleLanguageChange} />
          </div>
          <EmailSignIn onSuccess={handleAuthSuccess} lang={language} />
          <button onClick={() => setView('landing')} className="mt-10 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-indigo-600 transition-colors">Back</button>
        </div>
      </div>
    );
  }

  if (view === 'onboarding' && user) {
    return <OnboardingQuiz userName={user.name} lang={language} onComplete={handleOnboardingComplete} />;
  }

  if (view === 'generating') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center">
        <div className="relative mb-20 scale-150">
          <div className="absolute inset-0 bg-indigo-500/30 blur-3xl animate-pulse rounded-full" />
          <ColorfulLogo size="lg" className="relative z-10 animate-bounce" />
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">{t.pathway.generating}</h2>
        <div className="mt-20 w-80 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[loading_3s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${themeClasses.bg} flex flex-col`}>
      <nav className={`sticky top-0 z-50 border-b px-6 py-5 backdrop-blur-xl transition-all ${themeClasses.nav} flex justify-between items-center`}>
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('pathway')}>
          <ColorfulLogo size="sm" />
          <span className="text-3xl font-black tracking-tighter transition-all group-hover:scale-105 uppercase">Smarty</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 px-6 py-3 bg-white/40 rounded-full border border-slate-200/50 shadow-lg backdrop-blur-md">
            <span className="font-black text-indigo-900">🪙 {user?.coins || 0}</span>
            <StreakBadge streak={user?.streakState?.streakCount ?? user?.streak ?? 0} />
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center font-black shadow-xl">{user?.name[0]}</div>
          </div>
          <button onClick={() => { storageService.logout(); setUser(null); setView('landing'); }} className="text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest text-[10px] transition-colors">Logout</button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="w-20 md:w-72 border-r border-slate-100 p-4 md:p-8 flex flex-col gap-12 bg-white/80 backdrop-blur-md z-40 transition-all">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 hidden md:block">Menu</p>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setView('pathway')} 
                className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-5 py-4 rounded-2xl font-black transition-all ${view === 'pathway' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                title={t.nav.academy}
              >
                <span className="text-2xl md:text-xl">🎓</span>
                <span className="hidden md:inline">{t.nav.academy}</span>
              </button>
              <button 
                onClick={() => setView('calendar')} 
                className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-5 py-4 rounded-2xl font-black transition-all ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                title={t.nav.calendar}
              >
                <span className="text-2xl md:text-xl">🗓️</span>
                <span className="hidden md:inline">{t.nav.calendar}</span>
              </button>
              <button 
                onClick={() => setView('chatbot')} 
                className={`w-full flex items-center justify-center md:justify-start gap-4 px-3 md:px-5 py-4 rounded-2xl font-black transition-all ${view === 'chatbot' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                title={t.nav.chatbot}
              >
                <span className="text-2xl md:text-xl">🤖</span>
                <span className="hidden md:inline">{t.nav.chatbot}</span>
              </button>
            </nav>
          </div>
          <div className="mt-auto hidden md:block">
             <LanguageSwitcher currentLang={language} onLanguageChange={handleLanguageChange} isDark={user?.theme === 'cyberpunk'} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-20 relative bg-white/30">
          {user && lastRewards && (
            <RewardModal
              open={rewardOpen}
              xpGained={lastRewards.xpGained}
              coinsGained={lastRewards.coinsGained}
              streakDelta={lastRewards.streakDelta}
              currentStreak={user.streakState?.streakCount ?? user.streak ?? 0}
              onClose={() => {
                setRewardOpen(false);
                setLastRewards(null);
                setView('pathway');
              }}
            />
          )}
          {view === 'pathway' && (
            <div className="animate-in fade-in max-w-5xl mx-auto">
              {user?.smartInsights && (
                <div className="mb-20 bg-white p-12 rounded-[56px] border-2 border-indigo-50 shadow-2xl flex items-start gap-10">
                  <div className="text-5xl shrink-0 animate-bounce">🤖</div>
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase mb-4 tracking-widest">{t.pathway.mentorTitle}</h4>
                    <p className="text-slate-800 text-2xl font-bold italic leading-relaxed pr-10">"{user.smartInsights}"</p>
                  </div>
                </div>
              )}
              <h2 className="text-7xl font-black text-center mb-24 tracking-tighter text-slate-900 uppercase">{t.pathway.title}</h2>
              <LearningPath courses={COURSES} completedLessons={completedLessons} activeLessonId={activeLesson.id} onLessonClick={(c, l) => { setSelectedCourse(c); setActiveLesson(l); setView('lesson'); setQuizActive(false); setCurrentQuizIndex(0); }} lang={language} />
            </div>
          )}
          
          {view === 'chatbot' && user && (
            <ChatBot user={user} lang={language} themeClasses={themeClasses} />
          )}

          {view === 'calendar' && user && (
            <CalendarModule user={user} lang={language} themeClasses={themeClasses} onUpdateUser={handleUpdateUser} />
          )}

          {view === 'lesson' && (
            <div className="max-w-4xl mx-auto animate-in slide-in-from-right-12">
              <button onClick={() => setView('pathway')} className="mb-12 text-slate-400 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:text-indigo-600 transition-all hover:-translate-x-1">← {t.lesson.back}</button>
              <div className={`p-16 md:p-24 shadow-2xl transition-all duration-700 ${themeClasses.card} overflow-hidden`}>
                {!quizActive ? (
                  <div className="animate-in fade-in">
                    <div className="relative group mb-12">
                      <img src={activeLesson.imageUrl} className="w-full h-96 object-cover rounded-[40px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" alt="lesson hero" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-[40px]" />
                    </div>
                    <div className="flex justify-between items-start mb-12 gap-6">
                      <div>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-4 inline-block ${selectedCourse.color}`}>{selectedCourse.title}</span>
                        <h1 className="text-6xl font-black tracking-tighter leading-tight uppercase">{activeLesson.title}</h1>
                      </div>
                      <div className="shrink-0 scale-125">
                        <AudioButton text={activeLesson.content} lang={language} />
                      </div>
                    </div>
                    <div className={`prose-2xl font-bold mb-20 leading-relaxed ${themeClasses.prose}`}>{activeLesson.content}</div>
                    <button
                      onClick={() => {
                        setQuizActive(true);
                        setQuizFeedback(null);
                        setSelectedAnswer(null);
                        setCurrentQuizIndex(0);
                        setLessonStartTime(performance.now());
                      }}
                      className={`w-full py-10 text-white font-black text-3xl shadow-2xl transition-all active:scale-[0.98] hover:-translate-y-2 ${themeClasses.button}`}
                    >
                      {t.lesson.takeCheck}
                    </button>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right min-h-[500px] flex flex-col">
                    <div className="mb-12 flex justify-between items-center">
                      <div className="max-w-xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">Check Knowledge</h3>
                        <p className="text-4xl font-black tracking-tighter">{activeLesson.quiz?.[currentQuizIndex]?.question}</p>
                      </div>
                      <div className="shrink-0 w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center font-black border border-indigo-100 text-indigo-600 text-xl">{currentQuizIndex + 1}/{activeLesson.quiz?.length}</div>
                    </div>
                    <div className="space-y-4 mb-12 flex-1">
                      {activeLesson.quiz?.[currentQuizIndex]?.options.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleQuizAnswer(i)} 
                          className={`w-full p-8 text-left rounded-[32px] border-4 font-bold text-2xl transition-all active:scale-[0.99] ${
                            quizFeedback === 'correct' && i === activeLesson.quiz?.[currentQuizIndex]?.answerIndex 
                              ? themeClasses.quizCorrect 
                              : quizFeedback === 'wrong' && i === selectedAnswer 
                                ? themeClasses.quizWrong + ' animate-shake' 
                                : themeClasses.quizOption
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {quizFeedback === 'correct' && i === activeLesson.quiz?.[currentQuizIndex]?.answerIndex && <span>✨</span>}
                            {quizFeedback === 'wrong' && i === selectedAnswer && <span>❌</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setQuizActive(false)} className="mt-auto text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-600 transition-colors">Back to lesson</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
