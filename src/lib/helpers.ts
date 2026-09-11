import type { Slide, Vote } from "./types";

export function getVoterId(): string {
  if (typeof window === "undefined") return "";
  const key = "livevote_voter_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function countOptionVotes(votes: Vote[], optionCount: number): number[] {
  const counts = Array.from({ length: optionCount }, () => 0);
  for (const vote of votes) {
    if (typeof vote.value === "number" && vote.value >= 0 && vote.value < optionCount) {
      counts[vote.value] += 1;
    }
  }
  return counts;
}

export function wordFrequencies(votes: Vote[]): { word: string; count: number }[] {
  const map = new Map<string, number>();
  for (const vote of votes) {
    if (typeof vote.value !== "string") continue;
    const word = vote.value.trim().toLowerCase();
    if (!word) continue;
    map.set(word, (map.get(word) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

export function openEndedResponses(votes: Vote[]): { id: string; text: string; createdAt: number }[] {
  return votes
    .filter((v) => typeof v.value === "string" && v.value.trim())
    .map((v) => ({
      id: v.id,
      text: String(v.value),
      createdAt: v.createdAt,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function rankingScores(votes: Vote[], optionCount: number): number[] {
  const scores = Array.from({ length: optionCount }, () => 0);
  for (const vote of votes) {
    if (!Array.isArray(vote.value)) continue;
    vote.value.forEach((optionIndex, rank) => {
      if (optionIndex >= 0 && optionIndex < optionCount) {
        scores[optionIndex] += optionCount - rank;
      }
    });
  }
  return scores;
}

export function ratingAverage(votes: Vote[]): { average: number; distribution: number[]; total: number } {
  const numeric = votes
    .map((v) => v.value)
    .filter((v): v is number => typeof v === "number");
  const total = numeric.length;
  if (!total) return { average: 0, distribution: [], total: 0 };
  const max = Math.max(...numeric, 5);
  const distribution = Array.from({ length: max }, () => 0);
  let sum = 0;
  for (const n of numeric) {
    sum += n;
    if (n >= 1 && n <= max) distribution[n - 1] += 1;
  }
  return { average: sum / total, distribution, total };
}

export function hasVoted(slide: Slide, voterId: string): boolean {
  if (slide.type === "qa") return false;
  return slide.votes.some((v) => v.voterId === voterId);
}

export function getVoteValue(slide: Slide, voterId: string): Vote["value"] | null {
  const vote = slide.votes.find((v) => v.voterId === voterId);
  return vote ? vote.value : null;
}
