export type Flashcard = {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";
  topic: string;
  front: string;
  back: string;
};

import { physicsCards } from "./flashcards/physics";
import { chemistryCards } from "./flashcards/chemistry";
import { mathCards } from "./flashcards/math";
import { biologyCards } from "./flashcards/biology";

export const flashcardDecks: Record<string, Flashcard[]> = {
  "Physics Core Concepts": physicsCards as Flashcard[],
  "Chemistry Laws & Reactions": chemistryCards as Flashcard[],
  "Mathematics Formulas": mathCards as Flashcard[],
  "Biology Quick Recall": biologyCards as Flashcard[]
};

export const allDecks = Object.keys(flashcardDecks);
