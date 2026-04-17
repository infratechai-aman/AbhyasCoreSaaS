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

export interface UserSubscription {
  plan: "Free" | "Pro Monthly" | "Pro Yearly";
  status: "active" | "past_due" | "canceled" | "none";
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  expiryDate?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  subscription: UserSubscription;
}
