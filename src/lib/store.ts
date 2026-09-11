import { customAlphabet } from "nanoid";
import type {
  Presentation,
  PresentationSummary,
  QAItem,
  Slide,
  SlideType,
  Vote,
} from "./types";
import { VOTING_DURATION_MS } from "./types";
import { applyVotingDeadline } from "./voting";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

type Listener = (presentation: Presentation) => void;

interface Store {
  presentations: Map<string, Presentation>;
  codeIndex: Map<string, string>;
  listeners: Map<string, Set<Listener>>;
}

const globalForStore = globalThis as unknown as { __livevoteStore?: Store };

function getStore(): Store {
  if (!globalForStore.__livevoteStore) {
    globalForStore.__livevoteStore = {
      presentations: new Map(),
      codeIndex: new Map(),
      listeners: new Map(),
    };
    seedDemo(globalForStore.__livevoteStore);
  }
  return globalForStore.__livevoteStore;
}

function createSlide(type: SlideType, title: string, options: string[] = []): Slide {
  return {
    id: nanoid(),
    type,
    title,
    options,
    maxRating: 5,
    votes: [],
    questions: [],
    ...(type === "quiz" ? { correctIndex: 0 } : {}),
  };
}

function seedDemo(store: Store) {
  const code = "DEMO01";
  const presentation: Presentation = {
    id: "demo-presentation",
    title: "Welcome to LiveVote",
    code,
    currentSlideIndex: 0,
    status: "draft",
    showResults: true,
    votingOpen: false,
    votingClosesAt: null,
    createdAt: Date.now(),
    participants: [],
    slides: [
      createSlide("multiple_choice", "Who should win today's contest?", [
        "Alex Rivera",
        "Jordan Lee",
        "Sam Okonkwo",
        "Taylor Chen",
      ]),
      createSlide("word_cloud", "One word for this session"),
      createSlide("open_ended", "What do you hope to learn?"),
      createSlide("ranking", "Rank these icebreakers", [
        "Two truths and a lie",
        "Would you rather",
        "Speed networking",
        "Team trivia",
      ]),
      createSlide("rating", "How useful was the last talk?"),
      {
        ...createSlide("quiz", "What does LiveVote remove?", [
          "Participant caps",
          "Slide decks",
          "Wi‑Fi",
          "Coffee",
        ]),
        correctIndex: 0,
      },
      createSlide("qa", "Ask the speaker anything"),
    ],
  };
  store.presentations.set(presentation.id, presentation);
  store.codeIndex.set(code, presentation.id);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function emit(presentation: Presentation) {
  const store = getStore();
  const listeners = store.listeners.get(presentation.id);
  if (!listeners) return;
  const snapshot = clone(presentation);
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch {
      /* ignore broken listeners */
    }
  }
}

export function subscribe(presentationId: string, listener: Listener) {
  const store = getStore();
  if (!store.listeners.has(presentationId)) {
    store.listeners.set(presentationId, new Set());
  }
  store.listeners.get(presentationId)!.add(listener);
  return () => {
    store.listeners.get(presentationId)?.delete(listener);
  };
}

export function listPresentations(): PresentationSummary[] {
  const store = getStore();
  return Array.from(store.presentations.values())
    .map((p) => ({
      id: p.id,
      title: p.title,
      code: p.code,
      status: p.status,
      slideCount: p.slides.length,
      participantCount: p.participants.length,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function syncDeadline(presentation: Presentation) {
  if (applyVotingDeadline(presentation)) {
    emit(presentation);
  }
}

export function getPresentation(id: string): Presentation | null {
  const p = getStore().presentations.get(id);
  if (!p) return null;
  syncDeadline(p);
  return clone(p);
}

export function getPresentationByCode(code: string): Presentation | null {
  const store = getStore();
  const id = store.codeIndex.get(code.toUpperCase());
  if (!id) return null;
  return getPresentation(id);
}

export function createPresentation(title: string): Presentation {
  const store = getStore();
  let code = codeAlphabet();
  while (store.codeIndex.has(code)) code = codeAlphabet();

  const presentation: Presentation = {
    id: nanoid(),
    title: title.trim() || "Untitled presentation",
    code,
    slides: [
      createSlide("multiple_choice", "Untitled question", [
        "Option 1",
        "Option 2",
        "Option 3",
      ]),
    ],
    currentSlideIndex: 0,
    status: "draft",
    showResults: true,
    votingOpen: false,
    votingClosesAt: null,
    createdAt: Date.now(),
    participants: [],
  };

  store.presentations.set(presentation.id, presentation);
  store.codeIndex.set(code, presentation.id);
  return clone(presentation);
}

export function updatePresentation(
  id: string,
  patch: Partial<Pick<Presentation, "title" | "showResults" | "votingOpen">>,
): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  if (typeof patch.title === "string") presentation.title = patch.title;
  if (typeof patch.showResults === "boolean") {
    presentation.showResults = patch.showResults;
  }
  if (typeof patch.votingOpen === "boolean") {
    presentation.votingOpen = patch.votingOpen;
  }
  emit(presentation);
  return clone(presentation);
}

export function deletePresentation(id: string): boolean {
  const store = getStore();
  const presentation = store.presentations.get(id);
  if (!presentation) return false;
  store.codeIndex.delete(presentation.code);
  store.presentations.delete(id);
  store.listeners.delete(id);
  return true;
}

export function addSlide(presentationId: string, type: SlideType): Slide | null {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return null;

  const defaults: Record<SlideType, { title: string; options: string[] }> = {
    multiple_choice: {
      title: "New multiple choice",
      options: ["Option 1", "Option 2", "Option 3"],
    },
    word_cloud: { title: "Describe in one word", options: [] },
    open_ended: { title: "Share your thoughts", options: [] },
    ranking: {
      title: "Rank these options",
      options: ["First", "Second", "Third"],
    },
    rating: { title: "Rate this", options: [] },
    quiz: {
      title: "Quiz question",
      options: ["Answer A", "Answer B", "Answer C", "Answer D"],
    },
    qa: { title: "Q&A", options: [] },
  };

  const slide = createSlide(type, defaults[type].title, defaults[type].options);
  presentation.slides.push(slide);
  emit(presentation);
  return clone(slide);
}

export function updateSlide(
  presentationId: string,
  slideId: string,
  patch: Partial<Pick<Slide, "title" | "options" | "correctIndex" | "maxRating" | "type">>,
): Slide | null {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return null;
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  if (typeof patch.title === "string") slide.title = patch.title;
  if (Array.isArray(patch.options)) slide.options = patch.options;
  if (typeof patch.correctIndex === "number") slide.correctIndex = patch.correctIndex;
  if (typeof patch.maxRating === "number") slide.maxRating = patch.maxRating;
  if (patch.type) slide.type = patch.type;
  emit(presentation);
  return clone(slide);
}

export function deleteSlide(presentationId: string, slideId: string): boolean {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return false;
  if (presentation.slides.length <= 1) return false;
  const index = presentation.slides.findIndex((s) => s.id === slideId);
  if (index < 0) return false;
  presentation.slides.splice(index, 1);
  presentation.currentSlideIndex = Math.min(
    presentation.currentSlideIndex,
    presentation.slides.length - 1,
  );
  emit(presentation);
  return true;
}

export function reorderSlides(presentationId: string, slideIds: string[]): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return null;
  const map = new Map(presentation.slides.map((s) => [s.id, s]));
  const next = slideIds.map((id) => map.get(id)).filter(Boolean) as Slide[];
  if (next.length !== presentation.slides.length) return null;
  presentation.slides = next;
  emit(presentation);
  return clone(presentation);
}

export function startPresentation(id: string): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  presentation.status = "live";
  presentation.currentSlideIndex = 0;
  presentation.votingOpen = true;
  presentation.showResults = true;
  presentation.votingClosesAt = Date.now() + VOTING_DURATION_MS;

  // Auto-close when the 3-minute window ends
  const closesAt = presentation.votingClosesAt;
  setTimeout(() => {
    const current = getStore().presentations.get(id);
    if (!current) return;
    if (current.votingClosesAt === closesAt && current.votingOpen) {
      current.votingOpen = false;
      emit(current);
    }
  }, VOTING_DURATION_MS + 50);

  emit(presentation);
  return clone(presentation);
}

export function endPresentation(id: string): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  presentation.status = "ended";
  presentation.votingOpen = false;
  presentation.votingClosesAt = presentation.votingClosesAt ?? Date.now();
  emit(presentation);
  return clone(presentation);
}

export function navigateSlide(
  id: string,
  direction: "next" | "prev" | number,
): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(id);
  if (!presentation) return null;

  if (typeof direction === "number") {
    presentation.currentSlideIndex = Math.max(
      0,
      Math.min(direction, presentation.slides.length - 1),
    );
  } else if (direction === "next") {
    presentation.currentSlideIndex = Math.min(
      presentation.currentSlideIndex + 1,
      presentation.slides.length - 1,
    );
  } else {
    presentation.currentSlideIndex = Math.max(presentation.currentSlideIndex - 1, 0);
  }

  // Clear votes for quiz reveal feel? Keep votes — Mentimeter keeps them.
  emit(presentation);
  return clone(presentation);
}

export function joinPresentation(code: string, voterId: string): Presentation | null {
  const store = getStore();
  const id = store.codeIndex.get(code.toUpperCase());
  if (!id) return null;
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  syncDeadline(presentation);
  if (!presentation.participants.includes(voterId)) {
    presentation.participants.push(voterId);
    emit(presentation);
  }
  return clone(presentation);
}

export function submitVote(
  code: string,
  slideId: string,
  voterId: string,
  value: Vote["value"],
): Presentation | null {
  const store = getStore();
  const id = store.codeIndex.get(code.toUpperCase());
  if (!id) return null;
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  syncDeadline(presentation);
  if (!presentation.votingOpen || presentation.status !== "live") return null;

  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide || slide.type === "qa") return null;

  // One vote per voter per slide — replace existing
  slide.votes = slide.votes.filter((v) => v.voterId !== voterId);
  slide.votes.push({
    id: nanoid(),
    voterId,
    value,
    createdAt: Date.now(),
  });

  if (!presentation.participants.includes(voterId)) {
    presentation.participants.push(voterId);
  }

  emit(presentation);
  return clone(presentation);
}

export function submitQuestion(
  code: string,
  slideId: string,
  voterId: string,
  text: string,
  author: string,
): QAItem | null {
  const store = getStore();
  const id = store.codeIndex.get(code.toUpperCase());
  if (!id) return null;
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide || slide.type !== "qa") return null;

  const question: QAItem = {
    id: nanoid(),
    text: text.trim().slice(0, 280),
    author: author.trim().slice(0, 40) || "Anonymous",
    upvotes: 0,
    upvotedBy: [],
    highlighted: false,
    createdAt: Date.now(),
  };
  slide.questions.push(question);

  if (!presentation.participants.includes(voterId)) {
    presentation.participants.push(voterId);
  }

  emit(presentation);
  return clone(question);
}

export function upvoteQuestion(
  code: string,
  slideId: string,
  questionId: string,
  voterId: string,
): Presentation | null {
  const store = getStore();
  const id = store.codeIndex.get(code.toUpperCase());
  if (!id) return null;
  const presentation = store.presentations.get(id);
  if (!presentation) return null;
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  const question = slide.questions.find((q) => q.id === questionId);
  if (!question) return null;

  if (question.upvotedBy.includes(voterId)) {
    question.upvotedBy = question.upvotedBy.filter((v) => v !== voterId);
    question.upvotes = Math.max(0, question.upvotes - 1);
  } else {
    question.upvotedBy.push(voterId);
    question.upvotes += 1;
  }

  emit(presentation);
  return clone(presentation);
}

export function highlightQuestion(
  presentationId: string,
  slideId: string,
  questionId: string,
): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return null;
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  for (const q of slide.questions) {
    q.highlighted = q.id === questionId ? !q.highlighted : false;
  }
  emit(presentation);
  return clone(presentation);
}

export function clearSlideVotes(presentationId: string, slideId: string): Presentation | null {
  const store = getStore();
  const presentation = store.presentations.get(presentationId);
  if (!presentation) return null;
  const slide = presentation.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  slide.votes = [];
  slide.questions = [];
  emit(presentation);
  return clone(presentation);
}
