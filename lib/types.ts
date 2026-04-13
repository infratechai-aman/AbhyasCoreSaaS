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
