export type Subject = "Physics" | "Chemistry" | "Mathematics" | "Biology";

export type Question = {
  id: string;
  subject: Subject;
  chapter: string;
  difficulty: "Easy" | "Medium" | "Hard";
  examType: "JEE" | "NEET";
  questionText: string;
  options: string[];
  correctAnswer: string;
  solution: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
};
