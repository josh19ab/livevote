import type { Presentation } from "./types";

/** Close voting if the 3-minute window has elapsed. Mutates presentation. */
export function applyVotingDeadline(presentation: Presentation): boolean {
  if (
    presentation.votingOpen &&
    presentation.votingClosesAt != null &&
    Date.now() >= presentation.votingClosesAt
  ) {
    presentation.votingOpen = false;
    return true;
  }
  return false;
}

export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.ceil(msRemaining / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
