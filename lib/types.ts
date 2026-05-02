export type Subject = "Physics" | "Chemistry" | "Mathematics" | "Biology";

export interface Option {
  id: string; // A, B, C, D
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  subject?: Subject;
  chapter?: string;
}

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
};

export type PlanType = "Free" | "Pro Trial" | "Pro Monthly" | "Pro Yearly" | "Weekly Pass";

export interface UserSubscription {
  plan: PlanType;
  status: "active" | "past_due" | "canceled" | "none";
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  trialStartDate?: string;   // ISO date when free trial started
  expiryDate?: string;       // ISO date when trial/subscription expires
}

export interface UserUsage {
  /** ISO date string (YYYY-MM-DD) of the last tracked day */
  lastTrackedDate: string;
  /** Number of exams attempted on lastTrackedDate */
  examsAttemptedToday: number;
  /** AI tokens consumed on lastTrackedDate */
  aiTokensUsedToday: number;
  /** Number of custom exams created on lastTrackedDate */
  customExamsCreatedToday: number;
  /** ISO week string (YYYY-Wxx) of last tracked week */
  lastTrackedWeek: string;
  /** Number of custom exams created in lastTrackedWeek */
  customExamsCreatedWeek: number;
  /** Array of chapterId strings the user has already completed (for preventing free repeats) */
  completedExamIds: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  subscription: UserSubscription;
  usage?: UserUsage;
}

// ─── Plan Limits Configuration ───
export const PLAN_LIMITS = {
  Free: {
    examsPerDay: 1,
    canRepeatExams: false,
    aiTokensPerDay: 10000,
    customExamsPerWeek: 1,
    customExamsPerDay: 1,
    canAccessMarketPractice: false,
    canAccessRepository: false,
  },
  "Pro Trial": {
    examsPerDay: Infinity,
    canRepeatExams: true,
    aiTokensPerDay: 40000,
    customExamsPerWeek: 35,
    customExamsPerDay: 5,
    canAccessMarketPractice: true,
    canAccessRepository: true,
  },
  "Pro Monthly": {
    examsPerDay: Infinity,
    canRepeatExams: true,
    aiTokensPerDay: 40000,
    customExamsPerWeek: 35,
    customExamsPerDay: 5,
    canAccessMarketPractice: true,
    canAccessRepository: true,
  },
  "Pro Yearly": {
    examsPerDay: Infinity,
    canRepeatExams: true,
    aiTokensPerDay: 40000,
    customExamsPerWeek: 35,
    customExamsPerDay: 5,
    canAccessMarketPractice: true,
    canAccessRepository: true,
  },
  "Weekly Pass": {
    examsPerDay: Infinity,
    canRepeatExams: true,
    aiTokensPerDay: 40000,
    customExamsPerWeek: 35,
    customExamsPerDay: 5,
    canAccessMarketPractice: true,
    canAccessRepository: true,
  },
} as const;
