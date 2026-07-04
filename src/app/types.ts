export type Screen =
  | "onboarding-0" | "onboarding-1" | "onboarding-2" | "onboarding-3"
  | "home" | "intercept" | "log" | "celebration"
  | "journal" | "safe-foods" | "settings";

export type ReminderMode = "mealtimes" | "elapsed" | null;

export interface SafeFood {
  id: string;
  name: string;
  emoji: string;
  selected: boolean;
  useCount: number;
}

export interface JournalEntry {
  id: string;
  food: string;
  emoji: string;
  timestamp: Date;
  note: string;
  photoUrl?: string;
  accentColor: string;
}
