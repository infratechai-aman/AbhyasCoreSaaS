/**
 * Type definitions for the B2B Institute Portal feature.
 * 
 * Firestore Collections:
 * - institutes/{instituteId}
 * - institute_exams/{examId}
 * - institute_attempts/{attemptId}
 * - institute_exam_sessions/{sessionId}
 */

// ─── Institute ───
export interface Institute {
  name: string;
  ownerUid: string;         // Firebase Auth UID of the institute owner
  city: string;
  plan: InstitutePlan;
  createdAt: string;        // ISO date
  maxAttempts: number;      // Plan-based limit
  usedAttempts: number;     // Current usage count
}

export type InstitutePlan = "free" | "coaching" | "enterprise";

// ─── Institute Exam ───
export interface InstituteExam {
  title: string;
  targetExam: TargetExam;
  examType: ExamType;
  subjects: string[];       // ["Physics", "Chemistry", ...]
  chapters: string[];       // XML file names without extension: ["kinematics", "waves"]
  questionCount: number;
  difficulty: ExamDifficulty;
  passwordHash: string;     // bcrypt hash of the exam password
  duration: number;         // Duration in minutes
  allowRetake: boolean;
  resultVisibility: ResultVisibility;
  createdBy: string;        // Institute ID
  ownerUid: string;         // Firebase Auth UID for auth verification
  createdAt: string;        // ISO date
  status: ExamStatus;
  examCode: string;         // Unique 8-char alphanumeric code for join URL
}

export type TargetExam = "JEE" | "NEET";
export type ExamType = "chapter" | "subject" | "full";
export type ExamDifficulty = "easy" | "medium" | "hard" | "mixed";
export type ResultVisibility = "immediate" | "after_exam_ends" | "manual";
export type ExamStatus = "scheduled" | "live" | "ended";

// ─── Institute Attempt ───
export interface InstituteAttempt {
  examId: string;
  instituteId: string;
  studentName: string;
  rollNo: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  percentage: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeTaken: number;        // seconds
  submittedAt: string;      // ISO date
}

// ─── Institute Exam Session (server-side answer key) ───
export interface InstituteExamSession {
  examId: string;
  instituteId: string;
  answerKey: Record<string, { answer: string; explanation: string }>;
  questionCount: number;
  questions: any[];         // Full question objects for serving to students
  createdAt: string;
  expiresAt: string;
}

// ─── JWT Payload for exam session tokens ───
export interface ExamSessionTokenPayload {
  examId: string;
  instituteId: string;
  sessionId: string;
  studentName: string;
  rollNo: string;
  iat?: number;
  exp?: number;
}

// ─── API Request/Response types ───
export interface CreateExamRequest {
  title: string;
  targetExam: TargetExam;
  examType: ExamType;
  subjects: string[];
  chapters: string[];
  questionCount: number;
  difficulty: ExamDifficulty;
  password: string;
  duration: number;
  allowRetake: boolean;
  resultVisibility: ResultVisibility;
}

export interface VerifyExamRequest {
  examCode: string;
  password: string;
  studentName: string;
  rollNo: string;
}

export interface SubmitAttemptRequest {
  examSessionToken: string;
  answers: Record<string, string>;
  timeTaken: number;
}

// ─── Plan Limits ───
export const INSTITUTE_PLAN_LIMITS = {
  free: {
    maxAttempts: 500,
    maxExams: 10,
    maxQuestionsPerExam: 100,
  },
  coaching: {
    maxAttempts: 5000,
    maxExams: 100,
    maxQuestionsPerExam: 300,
  },
  enterprise: {
    maxAttempts: 50000,
    maxExams: 1000,
    maxQuestionsPerExam: 300,
  },
} as const;
