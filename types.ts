
export type Language = 'en' | 'vi';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  imageUrl?: string;
  quiz?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export enum Voice {
  KORE = 'Kore',
  PUCK = 'Puck',
  CHARON = 'Charon',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr'
}

export type LessonTheme = 'minimal' | 'cyberpunk' | 'academic' | 'playful';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface TimetableEntry {
  subject: string;
  time: string; // Start time
  endTime: string; // End time
}

// --- Gamification & personalization types ---
export type MentorPersona = 'friendly' | 'strict' | 'funny';

export type WeakArea = 'logic' | 'genai' | 'ethics' | 'foundations';

export interface StreakState {
  /** Current daily streak in days */
  streakCount: number;
  /** ISO date string (YYYY-MM-DD) for the last day the user was active */
  lastActiveDate: string;
  /** Number of available "streak freeze" items */
  streakFreezeCount: number;
  /** Longest streak the user has ever achieved */
  longestStreak: number;
}

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LeagueState {
  tier: LeagueTier;
  weeklyXp: number;
  weekStartDate: string; // ISO date for the start of the league week
  rank?: number; // optional client-side rank simulation
}

export interface UserProfile {
  name: string;
  email: string;
  grade: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  theme: LessonTheme;
  onboarded: boolean;
  smartInsights?: string;
  language?: Language;
  // --- Gamification ---
  coins?: number;
  /** Legacy streak field kept for backward compatibility; mirror of streakState.streakCount */
  streak?: number;
  streakState?: StreakState;
  xpTotal?: number;
  xpThisWeek?: number;
  league?: LeagueState;
  weakAreas?: Record<WeakArea, number>;
  mentorPersona?: MentorPersona;
  // --- Productivity features ---
  timetable?: Record<number, TimetableEntry[]>; // Day of week (0-6) -> entries
  notes?: string;
}
