import { BarChart3, BrainCircuit, FlaskConical, Orbit, Trophy, Zap } from "lucide-react";
import type { DashboardMetric, Question, Subject } from "@/lib/types";

export const navItems = ["Dashboard", "Tests", "Practice", "Performance", "AI Tutor", "Leaderboard", "Settings"];

export const heroStats = [
  { value: "2.1M+", label: "Questions practiced" },
  { value: "94%", label: "Students improved consistency" },
  { value: "AIR Predictor", label: "Exam-day confidence engine" }
];

export const featureCards = [
  {
    title: "Smart Mock Tests",
    description: "Chapter drills, sectional papers, and full exam simulations calibrated for real pressure.",
    icon: Zap
  },
  {
    title: "AI Performance Analysis",
    description: "Accuracy, speed, weak-topic clustering, and next-step coaching after every attempt.",
    icon: BrainCircuit
  },
  {
    title: "Motivating Competition",
    description: "Live ranks, streaks, and leaderboard momentum designed to keep students in flow.",
    icon: Trophy
  }
];

export const subjects: Array<{
  title: Subject;
  subtitle: string;
  icon: typeof Orbit;
  accent: string;
  details: string[];
}> = [
  {
    title: "Physics",
    subtitle: "Vectors, mechanics, fields, and motion intelligence.",
    icon: Orbit,
    accent: "from-cyan-400/30 to-sky-500/10",
    details: ["Kinematics heatmaps", "Formula recall cues", "Timer under stress"]
  },
  {
    title: "Chemistry",
    subtitle: "Organic pathways, reactions, and periodic confidence.",
    icon: FlaskConical,
    accent: "from-fuchsia-400/30 to-violet-500/10",
    details: ["Reaction chain mastery", "NCERT-weighted focus", "Molecular memory prompts"]
  },
  {
    title: "Mathematics",
    subtitle: "Integrals, graphs, and advanced pattern recognition.",
    icon: BarChart3,
    accent: "from-indigo-400/30 to-blue-500/10",
    details: ["Adaptive problem ladders", "Step-efficiency scoring", "JEE calculator mode"]
  },
  {
    title: "Biology",
    subtitle: "NCERT-rich practice with diagrams, cells, and systems.",
    icon: BrainCircuit,
    accent: "from-emerald-400/30 to-teal-500/10",
    details: ["DNA memory drills", "Diagram-linked MCQs", "High-retention revisions"]
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Today's Goal", value: "180 mins", change: "+20 mins vs yesterday" },
  { label: "Tests Completed", value: "24", change: "+3 this week" },
  { label: "Accuracy Rate", value: "78.4%", change: "+5.1% upward trend" },
  { label: "Current Rank Estimate", value: "AIR 3,218", change: "Projected from last 6 mocks" }
];

export const performanceBars = [
  { day: "Mon", score: 56 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 62 },
  { day: "Thu", score: 81 },
  { day: "Fri", score: 74 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 92 }
];

export const subjectAccuracy = [
  { name: "Physics", value: 72, color: "from-cyan-400 to-sky-500" },
  { name: "Chemistry", value: 84, color: "from-fuchsia-400 to-violet-500" },
  { name: "Mathematics", value: 76, color: "from-indigo-400 to-blue-500" },
  { name: "Biology", value: 91, color: "from-emerald-400 to-teal-500" }
];

export const sampleQuestion: Question = {
  id: "phy-001",
  text: "A wire of resistance 12 ohms is stretched to three times its original length without any change in volume. The new resistance is:",
  options: [
    { id: "A", text: "12 ohms" },
    { id: "B", text: "24 ohms" },
    { id: "C", text: "72 ohms" },
    { id: "D", text: "108 ohms" }
  ],
  answer: "D",
  explanation: "When the wire is stretched to 3L with constant volume, area becomes A/3. Resistance is proportional to L/A, so the new value becomes 9 times the original resistance.",
  difficulty: "medium",
  subject: "Physics",
  chapter: "Current Electricity"
};

export const leaderboard = [
  { name: "Aarav Sharma", score: 694, streak: 18, city: "Kota" },
  { name: "Siya Nair", score: 688, streak: 22, city: "Bengaluru" },
  { name: "Vivaan Mehta", score: 677, streak: 13, city: "Delhi" },
  { name: "Anika Rao", score: 671, streak: 27, city: "Hyderabad" }
];

export const pricing = [
  {
    name: "Free",
    price: "Rs 0",
    description: "A beautiful starting point for daily discipline.",
    features: ["Daily chapter-wise practice", "Basic analytics", "Limited AI analysis", "Leaderboard access"]
  },
  {
    name: "Pro Monthly",
    price: "Rs 67/mo",
    description: "Rs 29 for the 1st month. Built for ambitious aspirants chasing top ranks.",
    features: ["Unlimited mock tests", "Full AI tutor", "Deep analytics and rank prediction", "Revision mode and bookmarks"]
  },
  {
    name: "Pro Yearly",
    price: "Rs 499/yr",
    description: "Best value. Maximum commitment. Uninterrupted access to the premium engine.",
    features: ["All Pro Monthly features", "Priority doubt resolution", "Exclusive masterclasses"]
  }
];

export const adminRevenueData = [
  { month: "Jan", revenue: 120 },
  { month: "Feb", revenue: 210 },
  { month: "Mar", revenue: 480 },
  { month: "Apr", revenue: 640 },
];

export const adminRecentUsers = [
  { name: "Rahul Verma", email: "rahul.v@gmail.com", status: "Pro Yearly", joined: "Today", value: "Rs 499" },
  { name: "Sneha Reddy", email: "sneha.reddy@yahoo.com", status: "Pro Monthly", joined: "Yesterday", value: "Rs 29" },
  { name: "Aditya Singh", email: "aditya_s@outlook.com", status: "Free", joined: "Yesterday", value: "Rs 0" },
  { name: "Ananya Patel", email: "ananya.p_2026@gmail.com", status: "Pro Yearly", joined: "2 days ago", value: "Rs 499" },
  { name: "Karan S.", email: "karan.s@gmail.com", status: "Pro Monthly", joined: "3 days ago", value: "Rs 67" },
];
