import { z } from "zod";

// Core Question Schema
export const coreQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
});

// Module Question Schema
export const moduleQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  moduleId: z.string(),
});

// Response Schema (0-4 rating)
export const responseSchema = z.object({
  questionId: z.string(),
  rating: z.number().min(0).max(4),
});

// Assessment Result Schema
export const assessmentResultSchema = z.object({
  coreScore: z.number(),
  moduleScores: z.record(z.string(), z.number()),
  totalScore: z.number(),
  maxScore: z.number(),
  percentage: z.number(),
  stressLevel: z.enum(["Low", "Moderate", "High"]),
  dominantCategories: z.array(z.string()),
  completedAt: z.string(),
});

// Module Definition
export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: z.object({
    gradient: z.string(),
    primaryColor: z.string(),
  }),
  questions: z.array(moduleQuestionSchema),
});

// Types
export type CoreQuestion = z.infer<typeof coreQuestionSchema>;
export type ModuleQuestion = z.infer<typeof moduleQuestionSchema>;
export type Response = z.infer<typeof responseSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type Module = z.infer<typeof moduleSchema>;

// Core Questions Data
export const CORE_QUESTIONS: CoreQuestion[] = [
  { id: "c1", text: "How often do you feel overwhelmed by academic workload?", category: "academic" },
  { id: "c2", text: "How much pressure do you feel to maintain good grades?", category: "academic" },
  { id: "c3", text: "How often do you experience poor sleep quality?", category: "health" },
  { id: "c4", text: "How frequently do you face financial difficulties?", category: "financial" },
  { id: "c5", text: "How often do you feel isolated or lonely?", category: "social" },
  { id: "c6", text: "How frequently do you experience anxiety about your future?", category: "general" },
  { id: "c7", text: "How often do you struggle with time management?", category: "academic" },
  { id: "c8", text: "How much do family expectations stress you?", category: "social" },
  { id: "c9", text: "How often do you feel physically exhausted?", category: "health" },
  { id: "c10", text: "How frequently do you worry about career prospects?", category: "general" },
];

// Module Questions Data
export const MODULES: Module[] = [
  {
    id: "academic",
    name: "Academic Pressures",
    theme: {
      gradient: "from-violet-600 via-purple-600 to-blue-600",
      primaryColor: "rgb(139, 92, 246)",
    },
    questions: [
      { id: "a1", text: "How often do you feel unprepared for exams or assignments?", moduleId: "academic" },
      { id: "a2", text: "How much stress do course deadlines cause you?", moduleId: "academic" },
      { id: "a3", text: "How frequently do you struggle to understand course material?", moduleId: "academic" },
      { id: "a4", text: "How often do you feel pressure from academic competition?", moduleId: "academic" },
      { id: "a5", text: "How much does fear of failure affect your daily life?", moduleId: "academic" },
    ],
  },
  {
    id: "health",
    name: "Health & Lifestyle",
    theme: {
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      primaryColor: "rgb(16, 185, 129)",
    },
    questions: [
      { id: "h1", text: "How often do you skip meals due to time constraints?", moduleId: "health" },
      { id: "h2", text: "How frequently do you experience headaches or body aches?", moduleId: "health" },
      { id: "h3", text: "How much does lack of exercise affect your wellbeing?", moduleId: "health" },
      { id: "h4", text: "How often do you rely on caffeine to stay alert?", moduleId: "health" },
      { id: "h5", text: "How frequently do you feel physically drained by midday?", moduleId: "health" },
    ],
  },
  {
    id: "financial",
    name: "Financial & Practical Concerns",
    theme: {
      gradient: "from-amber-500 via-orange-500 to-yellow-600",
      primaryColor: "rgb(245, 158, 11)",
    },
    questions: [
      { id: "f1", text: "How often do you worry about student loans or debt?", moduleId: "financial" },
      { id: "f2", text: "How much stress does managing expenses cause you?", moduleId: "financial" },
      { id: "f3", text: "How frequently do you struggle to afford necessities?", moduleId: "financial" },
      { id: "f4", text: "How often do you feel burdened by part-time work commitments?", moduleId: "financial" },
      { id: "f5", text: "How much does financial uncertainty affect your focus?", moduleId: "financial" },
    ],
  },
  {
    id: "social",
    name: "Social & Relationships",
    theme: {
      gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      primaryColor: "rgb(244, 63, 94)",
    },
    questions: [
      { id: "s1", text: "How often do you feel disconnected from peers?", moduleId: "social" },
      { id: "s2", text: "How much do relationship conflicts stress you?", moduleId: "social" },
      { id: "s3", text: "How frequently do you feel you lack emotional support?", moduleId: "social" },
      { id: "s4", text: "How often do you experience social pressure or comparison?", moduleId: "social" },
      { id: "s5", text: "How much does homesickness or separation affect you?", moduleId: "social" },
    ],
  },
];
