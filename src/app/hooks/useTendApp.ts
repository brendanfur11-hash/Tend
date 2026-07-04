import { useEffect, useState } from "react";
import { ACCENT_COLORS, INITIAL_FOODS, SEED_ENTRIES } from "../data";
import { loadPersistedState, savePersistedState } from "../lib/storage";
import type { JournalEntry, ReminderMode, SafeFood, Screen } from "../types";

export function useTendApp() {
  const [screen, setScreen] = useState<Screen>("onboarding-0");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("elapsed");
  const [foods, setFoods] = useState<SafeFood[]>(INITIAL_FOODS);
  const [streak, setStreak] = useState(4);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(SEED_ENTRIES);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const saved = loadPersistedState();
    if (saved) {
      setScreen(saved.screen ?? "onboarding-0");
      setReminderMode(saved.reminderMode ?? "elapsed");
      setFoods(saved.foods ?? INITIAL_FOODS);
      setStreak(saved.streak ?? 4);
      setLastStreakDate(saved.lastStreakDate ?? null);
      setJournalEntries(saved.journalEntries ?? SEED_ENTRIES);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    savePersistedState({
      screen,
      reminderMode,
      foods,
      streak,
      lastStreakDate,
      journalEntries,
    });
  }, [hasHydrated, screen, reminderMode, foods, streak, lastStreakDate, journalEntries]);

  function toggleFood(id: string) {
    setFoods((current) => current.map((food) => (food.id === id ? { ...food, selected: !food.selected } : food)));
  }

  function removeFood(id: string) {
    setFoods((current) => current.filter((food) => food.id !== id));
  }

  function addFood(name: string) {
    setFoods((current) => [
      ...current,
      { id: `c-${Date.now()}`, name, emoji: pickEmoji(name), selected: true, useCount: 0 },
    ]);
  }

  function addJournalEntry(entry: { food: string; emoji: string; note: string; photoUrl?: string }) {
    const colorIdx = journalEntries.length % ACCENT_COLORS.length;
    const todayStr = new Date().toDateString();

    setJournalEntries((current) => [
      {
        id: `j-${Date.now()}`,
        food: entry.food,
        emoji: entry.emoji,
        timestamp: new Date(),
        note: entry.note,
        photoUrl: entry.photoUrl,
        accentColor: ACCENT_COLORS[colorIdx],
      },
      ...current,
    ]);

    if (lastStreakDate !== todayStr) {
      setStreak((current) => current + 1);
      setLastStreakDate(todayStr);
    }
  }

  function go(nextScreen: Screen) {
    setScreen(nextScreen);
  }

  return {
    screen,
    reminderMode,
    setReminderMode,
    foods,
    streak,
    journalEntries,
    toggleFood,
    removeFood,
    addFood,
    addJournalEntry,
    go,
  };
}

function pickEmoji(name: string): string {
  const lower = name.toLowerCase();
  const emojiMap: [string[], string][] = [
    [["apple", "apples"], "🍎"],
    [["avocado"], "🥑"],
    [["banana", "bananas"], "🍌"],
    [["blueberry", "blueberries"], "🫐"],
    [["cherry", "cherries"], "🍒"],
    [["coconut"], "🥥"],
    [["grape", "grapes"], "🍇"],
    [["kiwi"], "🥝"],
    [["lemon", "lime"], "🍋"],
    [["mango"], "🥭"],
    [["melon", "watermelon"], "🍉"],
    [["orange", "tangerine"], "🍊"],
    [["peach"], "🍑"],
    [["pear"], "🍐"],
    [["pineapple"], "🍍"],
    [["strawberry", "strawberries"], "🍓"],
    [["tomato", "tomatoes"], "🍅"],
    [["broccoli"], "🥦"],
    [["carrot", "carrots"], "🥕"],
    [["corn"], "🌽"],
    [["cucumber"], "🥒"],
    [["eggplant"], "🍆"],
    [["garlic"], "🧄"],
    [["lettuce", "salad", "greens"], "🥬"],
    [["mushroom", "mushrooms"], "🍄"],
    [["onion", "onions"], "🧅"],
    [["peas"], "🫛"],
    [["pepper", "peppers"], "🫑"],
    [["potato", "potatoes", "fries", "chips"], "🥔"],
    [["sweet potato"], "🍠"],
    [["almond", "almonds", "nut", "nuts", "peanut", "peanuts", "cashew", "walnut", "pecans"], "🥜"],
    [["seed", "seeds", "sunflower", "chia", "flax"], "🌱"],
    [["bread", "toast", "sourdough", "loaf", "baguette", "roll", "bun", "naan", "pita"], "🍞"],
    [["bagel"], "🥯"],
    [["croissant"], "🥐"],
    [["muffin", "muffins"], "🧁"],
    [["waffle", "waffles", "pancake", "pancakes"], "🧇"],
    [["rice"], "🍚"],
    [["sushi", "sashimi"], "🍱"],
    [["noodle", "noodles", "ramen", "pho", "udon", "soba", "pasta", "spaghetti", "lo mein", "pad thai"], "🍜"],
    [["dumpling", "dumplings", "gyoza"], "🥟"],
    [["taco", "tacos"], "🌮"],
    [["burrito", "wrap"], "🌯"],
    [["pizza"], "🍕"],
    [["burger", "sandwich"], "🥪"],
    [["hotdog", "hot dog"], "🌭"],
    [["egg", "eggs", "scrambled", "boiled", "fried egg", "omelet", "omelette"], "🍳"],
    [["bacon", "sausage"], "🥓"],
    [["chicken"], "🍗"],
    [["fish", "salmon", "tuna", "sardine"], "🐟"],
    [["shrimp", "prawn"], "🍤"],
    [["steak", "beef"], "🥩"],
    [["cheese", "cheddar", "brie", "feta", "mozzarella"], "🧀"],
    [["yogurt"], "🥣"],
    [["milk"], "🥛"],
    [["butter"], "🧈"],
    [["smoothie", "shake", "milkshake"], "🥤"],
    [["coffee", "latte", "espresso", "cappuccino"], "☕"],
    [["tea", "matcha", "chai"], "🍵"],
    [["juice"], "🍹"],
    [["soup", "broth", "stew", "miso", "chili", "curry"], "🍲"],
    [["hummus", "dip"], "🫕"],
    [["chocolate"], "🍫"],
    [["cake", "cupcake"], "🎂"],
    [["cookie", "cookies"], "🍪"],
    [["donut", "doughnut"], "🍩"],
    [["ice cream", "icecream", "gelato", "sorbet"], "🍦"],
    [["candy"], "🍬"],
    [["honey"], "🍯"],
    [["popcorn"], "🍿"],
    [["pretzel", "pretzels"], "🥨"],
    [["granola", "bar", "cereal", "oat", "oats", "oatmeal", "porridge"], "🥣"],
    [["fruit"], "🍑"],
    [["veggie", "vegetable", "vegetables"], "🥗"],
    [["leftovers"], "🍱"],
  ];

  for (const [keywords, emoji] of emojiMap) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return emoji;
    }
  }

  return "😋";
}
