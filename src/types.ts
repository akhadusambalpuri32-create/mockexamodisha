export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  examTarget: string; // e.g. "osssc-ri", "opsc-ocs", "chse-12-science"
  district: string; // e.g. "Khordha"
  coins: number;
  xp: number;
  streak: number;
  badges: Badge[];
  savedNotes: SavedNote[];
  testHistory: TestAttempt[];
  isGuest?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  marks: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  accuracy: number;
  timeSpent: number; // in seconds
  attemptedAt: string;
  aiFeedback?: string;
}

export interface Exam {
  id: string;
  name: string;
  short: string;
  subCategory?: string;
  durationMins: number;
  totalQuestions: number;
  difficulty: string;
  marksPerQuestion: number;
  negativeMarking: number;
  tests: { id: string; title: string; isFree: boolean }[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  shortExplanation?: string;
  subject: string;
  topic: string;
  passage?: string;
}

export interface CurrentAffair {
  id: string;
  pubDate: string;
  title: string;
  category: string;
  summary: string;
  details: string;
}

export interface JobAlert {
  id: string;
  title: string;
  posts: string;
  deadline: string;
  qual: string;
  link: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  district: string;
  points: number;
  testCount: number;
  activeStreak: number;
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  exam: string;
  text: string;
  time: string;
  likes: number;
  replies: { author: string; text: string }[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  size: string;
  type: string;
  downloads: number;
}
