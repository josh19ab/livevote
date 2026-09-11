export const VOTING_DURATION_MS = 3 * 60 * 1000; // 3 minutes after go live

export type SlideType =
  | "multiple_choice"
  | "word_cloud"
  | "open_ended"
  | "ranking"
  | "rating"
  | "quiz"
  | "qa";

export type PresentationStatus = "draft" | "live" | "ended";

export interface QAItem {
  id: string;
  text: string;
  author: string;
  upvotes: number;
  upvotedBy: string[];
  highlighted: boolean;
  createdAt: number;
}

export interface Vote {
  id: string;
  voterId: string;
  /** option index | free text | ranking order | rating number */
  value: number | string | number[];
  createdAt: number;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  options: string[];
  correctIndex?: number;
  maxRating: number;
  votes: Vote[];
  questions: QAItem[];
}

export interface Presentation {
  id: string;
  title: string;
  code: string;
  slides: Slide[];
  currentSlideIndex: number;
  status: PresentationStatus;
  showResults: boolean;
  votingOpen: boolean;
  /** Epoch ms when voting auto-closes (set on Go live) */
  votingClosesAt: number | null;
  createdAt: number;
  participants: string[];
}

export interface PresentationSummary {
  id: string;
  title: string;
  code: string;
  status: PresentationStatus;
  slideCount: number;
  participantCount: number;
  createdAt: number;
}

export const SLIDE_TYPE_META: Record<
  SlideType,
  { label: string; description: string; color: string }
> = {
  multiple_choice: {
    label: "Vote / poll",
    description: "Pick one option — searchable for large lists",
    color: "#0D9488",
  },
  word_cloud: {
    label: "Word cloud",
    description: "Audience submits words that grow by frequency",
    color: "#F97316",
  },
  open_ended: {
    label: "Open ended",
    description: "Free-text answers shown as a feed",
    color: "#0284C7",
  },
  ranking: {
    label: "Ranking",
    description: "Reorder options by preference",
    color: "#CA8A04",
  },
  rating: {
    label: "Scales",
    description: "Rate on a numeric scale",
    color: "#DB2777",
  },
  quiz: {
    label: "Quiz",
    description: "Multiple choice with a correct answer",
    color: "#7C3AED",
  },
  qa: {
    label: "Q&A",
    description: "Audience questions with upvotes",
    color: "#059669",
  },
};

export const CHART_COLORS = [
  "#0D9488",
  "#F97316",
  "#0284C7",
  "#CA8A04",
  "#DB2777",
  "#65A30D",
  "#EA580C",
  "#0891B2",
];
