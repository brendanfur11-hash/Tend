import type { JournalEntry, ReminderMode, SafeFood, Screen } from "../types";

export interface PersistedState {
  screen: Screen;
  reminderMode: ReminderMode;
  foods: SafeFood[];
  streak: number;
  lastStreakDate: string | null;
  journalEntries: JournalEntry[];
}

const STORAGE_KEY = "tend-app-state-v1";

function normalizeEntries(entries: unknown): JournalEntry[] {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => {
    const candidate = entry as Partial<JournalEntry> & { timestamp?: string | Date };
    return {
      ...candidate,
      timestamp: candidate.timestamp ? new Date(candidate.timestamp) : new Date(),
    } as JournalEntry;
  });
}

export function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      screen: parsed.screen ?? "onboarding-0",
      reminderMode: parsed.reminderMode ?? "elapsed",
      foods: Array.isArray(parsed.foods) ? parsed.foods : [],
      streak: typeof parsed.streak === "number" ? parsed.streak : 4,
      lastStreakDate: typeof parsed.lastStreakDate === "string" ? parsed.lastStreakDate : null,
      journalEntries: normalizeEntries(parsed.journalEntries),
    };
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return;

  const serializableState = {
    ...state,
    journalEntries: state.journalEntries.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    })),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState));
}
