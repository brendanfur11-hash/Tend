import type { JournalEntry, SafeFood } from "./types";

export const ACCENT_COLORS = ["#F3C9A8", "#C6BCD6", "#B7C4B0", "#F5D5C0", "#D4C5E8"];

export const today = new Date(2026, 6, 3);

export function daysAgo(n: number, h: number, m: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
}

export const SEED_ENTRIES: JournalEntry[] = [
  {
    id: "s1",
    food: "Yogurt",
    emoji: "🥣",
    timestamp: daysAgo(0, 8, 42),
    note: "Slow morning but I got there.",
    photoUrl: "https://images.unsplash.com/photo-1704735436097-a24b0f2d22cf?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F3C9A8",
  },
  {
    id: "s2",
    food: "Toast",
    emoji: "🍞",
    timestamp: daysAgo(0, 13, 15),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&h=400&fit=crop&auto=format",
    accentColor: "#C6BCD6",
  },
  {
    id: "s3",
    food: "Banana",
    emoji: "🍌",
    timestamp: daysAgo(0, 16, 30),
    note: "Mid-afternoon, felt okay",
    accentColor: "#B7C4B0",
  },
  {
    id: "s4",
    food: "A shake",
    emoji: "🥤",
    timestamp: daysAgo(1, 9, 5),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1514995428455-447d4443fa7f?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F5D5C0",
  },
  {
    id: "s5",
    food: "Leftovers",
    emoji: "🍱",
    timestamp: daysAgo(1, 14, 20),
    note: "Comfort food kind of day",
    accentColor: "#D4C5E8",
  },
  {
    id: "s6",
    food: "Fruit",
    emoji: "🍎",
    timestamp: daysAgo(1, 18, 45),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1482508809494-03688cd42e7e?w=600&h=400&fit=crop&auto=format",
    accentColor: "#B7C4B0",
  },
  {
    id: "s7",
    food: "Eggs",
    emoji: "🍳",
    timestamp: daysAgo(2, 10, 0),
    note: "Had energy to cook today",
    accentColor: "#F3C9A8",
  },
  {
    id: "s8",
    food: "Nuts",
    emoji: "🥜",
    timestamp: daysAgo(2, 15, 30),
    note: "",
    accentColor: "#C6BCD6",
  },
  {
    id: "s9",
    food: "Toast",
    emoji: "🍞",
    timestamp: daysAgo(3, 8, 15),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1564510715156-793609f9e8b5?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F5D5C0",
  },
];

export const INITIAL_FOODS: SafeFood[] = [
  { id: "1", name: "Banana", emoji: "🍌", selected: true, useCount: 8 },
  { id: "2", name: "Yogurt", emoji: "🥣", selected: true, useCount: 12 },
  { id: "3", name: "Toast", emoji: "🍞", selected: true, useCount: 10 },
  { id: "4", name: "Leftovers", emoji: "🍱", selected: true, useCount: 5 },
  { id: "5", name: "Nuts", emoji: "🥜", selected: false, useCount: 3 },
  { id: "6", name: "A shake", emoji: "🥤", selected: true, useCount: 7 },
  { id: "7", name: "Eggs", emoji: "🍳", selected: false, useCount: 4 },
  { id: "8", name: "Fruit", emoji: "🍎", selected: true, useCount: 6 },
];
