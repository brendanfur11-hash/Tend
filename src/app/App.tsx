import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock, Heart, Camera, Check, ChevronLeft, ChevronDown,
  Plus, Bell, Leaf, Sparkles, BookOpen, Settings, Home,
  CalendarOff, UserCheck, Waves, X, Pencil,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "onboarding-0" | "onboarding-1" | "onboarding-2" | "onboarding-3"
  | "home" | "intercept" | "log" | "celebration"
  | "journal" | "safe-foods" | "settings";

type ReminderMode = "mealtimes" | "elapsed" | null;

interface SafeFood {
  id: string; name: string; emoji: string; selected: boolean; useCount: number;
}

interface JournalEntry {
  id: string;
  food: string;
  emoji: string;
  timestamp: Date;
  note: string;
  photoUrl?: string;
  accentColor: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const ACCENT_COLORS = ["#F3C9A8", "#C6BCD6", "#B7C4B0", "#F5D5C0", "#D4C5E8"];

const today = new Date(2026, 6, 3); // July 3 2026 (Thursday)

function daysAgo(n: number, h: number, m: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
}

const SEED_ENTRIES: JournalEntry[] = [
  {
    id: "s1", food: "Yogurt", emoji: "🥣",
    timestamp: daysAgo(0, 8, 42),
    note: "Slow morning but I got there.",
    photoUrl: "https://images.unsplash.com/photo-1704735436097-a24b0f2d22cf?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F3C9A8",
  },
  {
    id: "s2", food: "Toast", emoji: "🍞",
    timestamp: daysAgo(0, 13, 15),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&h=400&fit=crop&auto=format",
    accentColor: "#C6BCD6",
  },
  {
    id: "s3", food: "Banana", emoji: "🍌",
    timestamp: daysAgo(0, 16, 30),
    note: "Mid-afternoon, felt okay",
    accentColor: "#B7C4B0",
  },
  {
    id: "s4", food: "A shake", emoji: "🥤",
    timestamp: daysAgo(1, 9, 5),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1514995428455-447d4443fa7f?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F5D5C0",
  },
  {
    id: "s5", food: "Leftovers", emoji: "🍱",
    timestamp: daysAgo(1, 14, 20),
    note: "Comfort food kind of day",
    accentColor: "#D4C5E8",
  },
  {
    id: "s6", food: "Fruit", emoji: "🍎",
    timestamp: daysAgo(1, 18, 45),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1482508809494-03688cd42e7e?w=600&h=400&fit=crop&auto=format",
    accentColor: "#B7C4B0",
  },
  {
    id: "s7", food: "Eggs", emoji: "🍳",
    timestamp: daysAgo(2, 10, 0),
    note: "Had energy to cook today",
    accentColor: "#F3C9A8",
  },
  {
    id: "s8", food: "Nuts", emoji: "🥜",
    timestamp: daysAgo(2, 15, 30),
    note: "",
    accentColor: "#C6BCD6",
  },
  {
    id: "s9", food: "Toast", emoji: "🍞",
    timestamp: daysAgo(3, 8, 15),
    note: "",
    photoUrl: "https://images.unsplash.com/photo-1564510715156-793609f9e8b5?w=600&h=400&fit=crop&auto=format",
    accentColor: "#F5D5C0",
  },
];

const INITIAL_FOODS: SafeFood[] = [
  { id: "1", name: "Banana", emoji: "🍌", selected: true, useCount: 8 },
  { id: "2", name: "Yogurt", emoji: "🥣", selected: true, useCount: 12 },
  { id: "3", name: "Toast", emoji: "🍞", selected: true, useCount: 10 },
  { id: "4", name: "Leftovers", emoji: "🍱", selected: true, useCount: 5 },
  { id: "5", name: "Nuts", emoji: "🥜", selected: false, useCount: 3 },
  { id: "6", name: "A shake", emoji: "🥤", selected: true, useCount: 7 },
  { id: "7", name: "Eggs", emoji: "🍳", selected: false, useCount: 4 },
  { id: "8", name: "Fruit", emoji: "🍎", selected: true, useCount: 6 },
];

const TIMES = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"];

// ─── Spell correction ─────────────────────────────────────────────────────────

const FOOD_VOCAB = [
  "apple","apples","apricot","avocado","banana","bananas","blueberry","blueberries",
  "cherry","cherries","coconut","cranberry","fig","grape","grapes","grapefruit",
  "guava","kiwi","lemon","lime","lychee","mango","melon","nectarine","orange",
  "papaya","peach","pear","pineapple","plum","pomegranate","raspberry","raspberries",
  "strawberry","strawberries","tangerine","watermelon","fruit","fruits",
  "artichoke","asparagus","avocado","beet","beets","broccoli","brussels","sprouts",
  "cabbage","carrot","carrots","cauliflower","celery","corn","cucumber","eggplant",
  "garlic","ginger","kale","leek","lettuce","mushroom","mushrooms","onion","onions",
  "parsnip","peas","pepper","peppers","potato","potatoes","pumpkin","radish",
  "spinach","squash","sweet","tomato","tomatoes","turnip","zucchini","veggie","veggies",
  "almond","almonds","cashew","cashews","chestnut","hazelnut","macadamia","peanut",
  "peanuts","pecan","pecans","pistachio","walnut","walnuts","nut","nuts","seed","seeds",
  "sunflower","pumpkin","flaxseed","chia","sesame",
  "bagel","baguette","bread","brioche","bun","ciabatta","croissant","flatbread",
  "focaccia","loaf","muffin","muffins","naan","pita","pretzel","roll","rolls",
  "sourdough","toast","tortilla","waffle","waffles","wrap","cracker","crackers",
  "cereal","granola","oatmeal","oats","porridge","quinoa","rice","pasta","noodles",
  "noodle","spaghetti","ramen","udon","soba","lasagna","risotto","couscous","grits",
  "polenta","barley","lentils","lentil","beans","bean","chickpeas","hummus","tofu",
  "tempeh","edamame","falafel",
  "beef","chicken","duck","fish","ham","lamb","pork","salmon","sardine","sardines",
  "shrimp","steak","tuna","turkey","veal","venison","bacon","sausage","sausages",
  "meatball","meatballs","kebab","jerky","egg","eggs","scrambled","boiled","fried",
  "poached","omelet","omelette",
  "brie","cheddar","cheese","cottage","cream","feta","gouda","mozzarella","parmesan",
  "ricotta","swiss","yogurt","milk","butter","ghee","kefir","cream","whipped",
  "smoothie","shake","milkshake","latte","cappuccino","espresso","coffee","tea",
  "juice","lemonade","soup","broth","stock","stew","chili","curry","gravy","sauce",
  "salsa","guacamole","dip","spread","jam","jelly","honey","syrup","peanut",
  "almond","butter","tahini","mayo","mayonnaise","mustard","ketchup","relish",
  "pickle","pickles","vinegar","dressing","ranch","caesar","balsamic",
  "cake","candy","chocolate","cookie","cookies","brownie","brownie","cupcake",
  "donut","doughnut","gelato","ice","cream","icecream","macaron","macaroon","pie",
  "pudding","sorbet","tart","truffle","wafer","marshmallow","caramel","fudge",
  "chips","crackers","popcorn","pretzel","pretzels","rice","cakes","granola","bar",
  "trail","mix","hummus","celery","sticks","protein","bar","energy","bite","bites",
  "pizza","burger","sandwich","salad","burrito","taco","tacos","wrap","bowl","bowl",
  "sushi","sashimi","dumpling","dumplings","gyoza","spring","roll","rolls","samosa",
  "pancake","pancakes","crepe","crepes","french","toast","hash","browns","grits",
  "leftovers","snack","snacks","meal","lunch","dinner","breakfast","brunch",
  "miso","ramen","pho","pad","thai","fried","rice","lo","mein","bibimbap",
  "shakshuka","frittata","quiche","benedict","hollandaise","avocado","toast",
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function closestFoodWord(word: string): string {
  const w = word.toLowerCase();
  if (FOOD_VOCAB.includes(w)) return word;
  if (w.length <= 3) return word;
  let best = word, bestDist = Infinity;
  const maxDist = w.length <= 5 ? 1 : 2;
  for (const v of FOOD_VOCAB) {
    if (Math.abs(v.length - w.length) > maxDist) continue;
    const d = levenshtein(w, v);
    if (d < bestDist) { bestDist = d; best = v; }
  }
  return bestDist <= maxDist ? best : word;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function correctFood(input: string): string {
  return titleCase(
    input.trim().split(/\s+/).map(closestFoodWord).join(" ")
  );
}

function useSpellSuggest(value: string) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  useEffect(() => {
    if (!value.trim()) { setSuggestion(null); return; }
    const corrected = correctFood(value);
    const raw = titleCase(value.trim());
    setSuggestion(corrected !== raw ? corrected : null);
  }, [value]);
  return suggestion;
}

function FoodInput({ value, onChange, onAdd, placeholder }: {
  value: string; onChange: (v: string) => void; onAdd: (v: string) => void; placeholder?: string;
}) {
  const suggestion = useSpellSuggest(value);

  function handleAdd(v: string) {
    if (!v.trim()) return;
    onAdd(titleCase(v.trim()));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd(suggestion ?? value)}
          placeholder={placeholder ?? "Add your own safe food..."}
          autoCapitalize="words"
          autoCorrect="on"
          spellCheck
          className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={() => handleAdd(suggestion ?? value)}
          disabled={!value.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 shrink-0"
          style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>
          <Plus size={18} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
      {suggestion && (
        <motion.button
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
          onClick={() => { onChange(suggestion); }}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent/30 border border-primary/20 text-foreground hover:bg-accent/50 transition-colors"
        >
          <span className="text-muted-foreground">Did you mean:</span>
          <span className="text-foreground">{suggestion}</span>
          <span className="ml-0.5 text-primary/70">↵</span>
        </motion.button>
      )}
    </div>
  );
}

// ─── Emoji picker ─────────────────────────────────────────────────────────────

const EMOJI_MAP: [string[], string][] = [
  [["apple","apples"], "🍎"],
  [["avocado"], "🥑"],
  [["banana","bananas"], "🍌"],
  [["blueberry","blueberries"], "🫐"],
  [["cherry","cherries"], "🍒"],
  [["coconut"], "🥥"],
  [["grape","grapes"], "🍇"],
  [["kiwi"], "🥝"],
  [["lemon","lime"], "🍋"],
  [["mango"], "🥭"],
  [["melon","watermelon"], "🍉"],
  [["orange","tangerine"], "🍊"],
  [["peach"], "🍑"],
  [["pear"], "🍐"],
  [["pineapple"], "🍍"],
  [["strawberry","strawberries"], "🍓"],
  [["tomato","tomatoes"], "🍅"],
  [["broccoli"], "🥦"],
  [["carrot","carrots"], "🥕"],
  [["corn"], "🌽"],
  [["cucumber"], "🥒"],
  [["eggplant"], "🍆"],
  [["garlic"], "🧄"],
  [["lettuce","salad","greens"], "🥬"],
  [["mushroom","mushrooms"], "🍄"],
  [["onion","onions"], "🧅"],
  [["peas"], "🫛"],
  [["pepper","peppers"], "🫑"],
  [["potato","potatoes","fries","chips"], "🥔"],
  [["sweet potato"], "🍠"],
  [["almond","almonds","nut","nuts","peanut","peanuts","cashew","walnut","pecans"], "🥜"],
  [["seed","seeds","sunflower","chia","flax"], "🌱"],
  [["bread","toast","sourdough","loaf","baguette","roll","bun","naan","pita"], "🍞"],
  [["bagel"], "🥯"],
  [["croissant"], "🥐"],
  [["muffin","muffins"], "🧁"],
  [["waffle","waffles","pancake","pancakes"], "🧇"],
  [["rice"], "🍚"],
  [["sushi","sashimi"], "🍱"],
  [["noodle","noodles","ramen","pho","udon","soba","pasta","spaghetti","lo mein","pad thai"], "🍜"],
  [["dumpling","dumplings","gyoza"], "🥟"],
  [["taco","tacos"], "🌮"],
  [["burrito","wrap"], "🌯"],
  [["pizza"], "🍕"],
  [["burger","sandwich"], "🥪"],
  [["hotdog","hot dog"], "🌭"],
  [["egg","eggs","scrambled","boiled","fried egg","omelet","omelette"], "🍳"],
  [["bacon","sausage"], "🥓"],
  [["chicken"], "🍗"],
  [["fish","salmon","tuna","sardine"], "🐟"],
  [["shrimp","prawn"], "🍤"],
  [["steak","beef"], "🥩"],
  [["cheese","cheddar","brie","feta","mozzarella"], "🧀"],
  [["yogurt"], "🥣"],
  [["milk"], "🥛"],
  [["butter"], "🧈"],
  [["smoothie","shake","milkshake"], "🥤"],
  [["coffee","latte","espresso","cappuccino"], "☕"],
  [["tea","matcha","chai"], "🍵"],
  [["juice"], "🍹"],
  [["soup","broth","stew","miso","chili","curry"], "🍲"],
  [["hummus","dip"], "🫕"],
  [["chocolate"], "🍫"],
  [["cake","cupcake"], "🎂"],
  [["cookie","cookies"], "🍪"],
  [["donut","doughnut"], "🍩"],
  [["ice cream","icecream","gelato","sorbet"], "🍦"],
  [["candy"], "🍬"],
  [["honey"], "🍯"],
  [["popcorn"], "🍿"],
  [["pretzel","pretzels"], "🥨"],
  [["granola","bar","cereal","oat","oats","oatmeal","porridge"], "🥣"],
  [["fruit"], "🍑"],
  [["veggie","vegetable","vegetables"], "🥗"],
  [["leftovers"], "🍱"],
];

function pickEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [keywords, emoji] of EMOJI_MAP) {
    if (keywords.some((k) => lower.includes(k))) return emoji;
  }
  return "😋";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useTimeSince(startMinutes: number) {
  const [elapsed, setElapsed] = useState(startMinutes);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(elapsed / 60);
  const m = elapsed % 60;
  if (elapsed < 60) return `${elapsed} minutes`;
  if (m === 0) return `${h} hour${h !== 1 ? "s" : ""}`;
  return `${h}h ${m}m`;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDayHeading(d: Date) {
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function groupByDay(entries: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>();
  [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).forEach((e) => {
    const key = e.timestamp.toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  });
  return Array.from(map.entries()).map(([key, es]) => ({
    date: new Date(key),
    label: formatDayHeading(new Date(key)),
    entries: es.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  }));
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Card({ children, className = "", onClick, style }: {
  children: React.ReactNode; className?: string; onClick?: () => void; style?: React.CSSProperties;
}) {
  return (
    <div onClick={onClick} style={style}
      className={`bg-card rounded-[1.75rem] shadow-[0_4px_24px_rgba(58,52,47,0.07)] ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all active:scale-[0.97] disabled:opacity-40 ${className}`}
      style={{ background: disabled ? "#D4C4B8" : "linear-gradient(135deg, #F3C9A8 0%, #E8967A 100%)", boxShadow: disabled ? "none" : "0 8px 24px rgba(232,150,122,0.3)" }}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }: {
  children: React.ReactNode; onClick?: () => void; className?: string;
}) {
  return (
    <button onClick={onClick}
      className={`py-3 px-6 rounded-2xl text-muted-foreground font-semibold text-base transition-all active:scale-[0.97] hover:text-foreground ${className}`}>
      {children}
    </button>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex justify-center" style={{ minHeight: "100dvh", fontFamily: "'Nunito', sans-serif" }}>
      <div
        className="relative w-full max-w-[430px] bg-background flex flex-col overflow-hidden"
        style={{
          minHeight: "100dvh",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const tabs = [
    { id: "home" as Screen, icon: Home, label: "Home" },
    { id: "journal" as Screen, icon: BookOpen, label: "Journal" },
    { id: "safe-foods" as Screen, icon: Leaf, label: "Foods" },
    { id: "settings" as Screen, icon: Settings, label: "Settings" },
  ];
  return (
    <div className="shrink-0 flex items-center justify-around px-2 pb-6 pt-3 bg-card border-t border-border"
      style={{ boxShadow: "0 -4px 20px rgba(58,52,47,0.05)" }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onNavigate(t.id)} className="flex flex-col items-center gap-1 px-4 py-1">
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? "text-primary" : "text-muted-foreground"} />
            <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DotProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-primary" : "w-2 bg-muted"}`} />
      ))}
    </div>
  );
}

// ─── Onboarding screens ───────────────────────────────────────────────────────

function OnboardingWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-7 pt-8 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}>
          <div className="w-28 h-28 rounded-full flex items-center justify-center text-6xl"
            style={{ background: "linear-gradient(145deg, #FFF0E6, #F3C9A8)" }}>🌿</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }} className="flex flex-col gap-3">
          <h1 className="text-[2rem] font-extrabold text-foreground leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hi, I'm Tend.</h1>
          <p className="text-lg text-foreground/80 font-semibold leading-relaxed">
            I'm here to remind you to eat — on your terms.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            No nagging. No shame. No calorie counts. Just a soft nudge when you need one.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }} className="w-full flex flex-col gap-3 mt-2">
          {["No judgment, ever", "One tap is enough", "Set your own pace"].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>
                <Check size={11} strokeWidth={3} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="w-full flex flex-col gap-4 mt-6">
        <PrimaryButton onClick={onNext}>Let's get started</PrimaryButton>
        <DotProgress total={4} current={0} />
      </motion.div>
    </div>
  );
}

const DRUM_ITEM_H = 46;
const DRUM_VISIBLE = 5;
const DRUM_H = DRUM_ITEM_H * DRUM_VISIBLE;
const DRUM_CENTER = Math.floor(DRUM_VISIBLE / 2);

function DrumColumn({ items, selectedIndex, onChange }: {
  items: string[]; selectedIndex: number; onChange: (i: number) => void;
}) {
  const dragRef = useRef<{ startY: number; startIndex: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = dragRef.current !== null;

  const translateY = (DRUM_CENTER - selectedIndex) * DRUM_ITEM_H + dragOffset;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = { startY: e.clientY, startIndex: selectedIndex };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setDragOffset(e.clientY - dragRef.current.startY);
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    const steps = -Math.round(dragOffset / DRUM_ITEM_H);
    const next = Math.max(0, Math.min(items.length - 1, dragRef.current.startIndex + steps));
    onChange(next);
    setDragOffset(0);
    dragRef.current = null;
  }

  return (
    <div className="relative flex-1 select-none cursor-grab active:cursor-grabbing"
      style={{ height: DRUM_H, overflow: "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}>

      {/* top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: DRUM_ITEM_H * DRUM_CENTER,
          background: "linear-gradient(to bottom, var(--card) 0%, transparent 100%)" }} />
      {/* bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: DRUM_ITEM_H * DRUM_CENTER,
          background: "linear-gradient(to top, var(--card) 0%, transparent 100%)" }} />
      {/* selection band */}
      <div className="absolute inset-x-0 z-0 pointer-events-none rounded-xl"
        style={{ top: DRUM_CENTER * DRUM_ITEM_H, height: DRUM_ITEM_H,
          background: "rgba(243,201,168,0.25)", borderTop: "1px solid rgba(232,150,122,0.3)", borderBottom: "1px solid rgba(232,150,122,0.3)" }} />

      <div style={{
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}>
        {items.map((item, i) => {
          const dist = Math.abs(i - selectedIndex - dragOffset / DRUM_ITEM_H);
          const opacity = dist < 0.5 ? 1 : dist < 1.5 ? 0.45 : 0.18;
          const scale = dist < 0.5 ? 1 : dist < 1.5 ? 0.88 : 0.78;
          return (
            <div key={i} style={{ height: DRUM_ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
              opacity, transform: `scale(${scale})`, transition: isDragging ? "none" : "opacity 0.15s, transform 0.15s" }}>
              <span className="text-xl font-bold tabular-nums text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

function OnboardingDayStart({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [hourIdx, setHourIdx] = useState(7);   // 8 AM
  const [minIdx, setMinIdx] = useState(0);
  const [periodIdx, setPeriodIdx] = useState(0);

  const displayTime = `${HOURS[hourIdx]}:${MINUTES[minIdx]} ${PERIODS[periodIdx]}`;

  return (
    <div className="flex-1 flex flex-col px-7 pt-5 pb-8">
      <button onClick={onBack} className="self-start text-muted-foreground mb-5"><ChevronLeft size={24} /></button>
      <div className="flex-1 flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-5xl mb-4">🌅</div>
          <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>When does your day usually start?</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We'll use this to quietly figure out your meal windows — no strict schedule.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-center">
              <span className="text-sm font-semibold text-muted-foreground">{displayTime}</span>
            </div>
            <div className="flex items-center px-4 pb-4">
              <DrumColumn items={HOURS} selectedIndex={hourIdx} onChange={setHourIdx} />
              <span className="text-2xl font-bold text-muted-foreground mb-0.5 shrink-0">:</span>
              <DrumColumn items={MINUTES} selectedIndex={minIdx} onChange={setMinIdx} />
              <div className="w-2 shrink-0" />
              <DrumColumn items={PERIODS} selectedIndex={periodIdx} onChange={setPeriodIdx} />
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <PrimaryButton onClick={onNext}>That sounds about right →</PrimaryButton>
        <DotProgress total={4} current={1} />
      </div>
    </div>
  );
}

function OnboardingTimingStyle({ onNext, onBack, mode, setMode }: {
  onNext: () => void; onBack: () => void; mode: ReminderMode; setMode: (m: ReminderMode) => void;
}) {
  return (
    <div className="flex-1 flex flex-col px-7 pt-5 pb-8">
      <button onClick={onBack} className="self-start text-muted-foreground mb-5"><ChevronLeft size={24} /></button>
      <div className="flex-1 flex flex-col gap-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-5xl mb-4">🔔</div>
          <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>How should I check in with you?</h1>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }} className="flex flex-col gap-4">
          {[
            { id: "mealtimes" as ReminderMode, emoji: "🍽️", title: "Remind me around mealtimes", sub: "A soft nudge during breakfast, lunch, and dinner windows." },
            { id: "elapsed" as ReminderMode, emoji: "⏱️", title: "Nudge me if it's been a while since I ate", sub: "Only checks in after several hours have passed since you last logged." },
          ].map((opt) => (
            <Card key={opt.id} onClick={() => setMode(opt.id)}
              className={`p-5 border-2 transition-all ${mode === opt.id ? "border-primary" : "border-transparent"}`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-base mb-1">{opt.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{opt.sub}</p>
                </div>
                {mode === opt.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </motion.div>
                )}
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
      <div className="flex flex-col gap-4 mt-6">
        <PrimaryButton onClick={onNext} disabled={!mode}>Sounds good →</PrimaryButton>
        <DotProgress total={4} current={2} />
      </div>
    </div>
  );
}

function OnboardingSafeFoods({ onDone, onBack, foods, toggleFood, addFood }: {
  onDone: () => void; onBack: () => void; foods: SafeFood[]; toggleFood: (id: string) => void; addFood: (name: string) => void;
}) {
  const [newFood, setNewFood] = useState("");
  const count = foods.filter((f) => f.selected).length;

  return (
    <div className="flex-1 flex flex-col pt-5 overflow-hidden">
      <div className="px-7">
        <button onClick={onBack} className="text-muted-foreground mb-5 block"><ChevronLeft size={24} /></button>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="mb-5">
          <div className="text-5xl mb-3">🧺</div>
          <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            What can you always manage on a rough day?
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Pick your no-think foods. These are what I'll suggest when you need a gentle nudge.
          </p>
        </motion.div>
      </div>
      <div className="flex-1 overflow-y-auto px-7">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {foods.map((food) => (
            <button key={food.id} onClick={() => toggleFood(food.id)}
              className={`flex items-center gap-2 p-3.5 rounded-2xl border-2 text-left transition-all ${food.selected ? "border-primary bg-accent/25 text-foreground" : "border-border bg-card text-muted-foreground"}`}>
              <span className="text-2xl">{food.emoji}</span>
              <span className="text-sm font-semibold leading-tight flex-1">{food.name}</span>
              {food.selected && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>
                  <Check size={10} strokeWidth={3} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="px-7 pt-3 pb-2 border-t border-border bg-background shrink-0">
        <p className="text-xs font-bold text-muted-foreground mb-2">Not on your list?</p>
        <FoodInput
          value={newFood}
          onChange={setNewFood}
          onAdd={(v) => { addFood(v); setNewFood(""); }}
          placeholder="Add your own safe food..."
        />
      </div>
      <div className="px-7 pb-8 pt-3 shrink-0 flex flex-col gap-4">
        <PrimaryButton onClick={onDone}>
          {count === 0 ? "Skip for now →" : "I'm good with these →"}
        </PrimaryButton>
        <DotProgress total={4} current={3} />
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeScreen({ onAte, onIntercept, streak, mode }: {
  onAte: () => void; onIntercept: () => void; streak: number; mode: ReminderMode;
}) {
  const elapsed = useTimeSince(247);
  const dots = Array.from({ length: 7 });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(243,201,168,0.18) 0%, rgba(250,246,241,0) 100%)" }} />
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 flex flex-col gap-5 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-semibold">Good afternoon</p>
            <h1 className="text-2xl font-extrabold text-foreground"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>How are you doing? 🌿</h1>
          </div>
          <button onClick={onIntercept} className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm">
            <Bell size={18} className="text-muted-foreground" />
          </button>
        </div>

        <Card className="p-5">
          {mode === "elapsed" ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">It's been</p>
              <p className="text-3xl font-extrabold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{elapsed} since you ate</p>
              <p className="text-sm text-muted-foreground leading-relaxed">No rush — just here when you're ready.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next window</p>
              <p className="text-3xl font-extrabold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lunch, around 1pm</p>
              <p className="text-sm text-muted-foreground leading-relaxed">About an hour away — no pressure.</p>
            </div>
          )}
        </Card>

        <div className="flex flex-col items-center py-2">
          <motion.button
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.2 }}
            whileTap={{ scale: 0.94 }}
            onClick={onAte}
            className="w-52 h-52 rounded-full flex flex-col items-center justify-center text-white"
            style={{
              background: "linear-gradient(145deg, #F3C9A8 0%, #E8967A 55%, #D97B5E 100%)",
              boxShadow: "0 14px 48px rgba(232,150,122,0.42), 0 0 0 10px rgba(243,201,168,0.18)",
            }}>
            <span className="text-5xl mb-2">🍽️</span>
            <span className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>I ate</span>
          </motion.button>
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} className="text-primary" fill="#E8967A" />
            <span className="font-bold text-foreground text-sm">Days you've shown up</span>
          </div>
          <div className="flex items-end gap-2 justify-center">
            {dots.map((_, i) => {
              // Show the last 7 days earned, growing left-to-right
              const displayCount = Math.min(streak, 7);
              const filled = i < displayCount;
              const isNext = i === displayCount && streak < 7;
              const dayNum = i + 1; // 1–7, controls size
              const size = filled ? 20 + (dayNum - 1) * 4 : isNext ? 20 : 16;
              const fontSize = filled ? 10 + (dayNum - 1) * 2 : 10;
              return (
                <motion.div key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 18 }}
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: size, height: size,
                    background: filled
                      ? "linear-gradient(135deg, #F3C9A8, #E8967A)"
                      : isNext ? "transparent" : "#F0E8DF",
                    boxShadow: filled ? "0 2px 8px rgba(232,150,122,0.3)" : "none",
                    border: isNext ? "2px dashed rgba(232,150,122,0.5)" : "none",
                  }}>
                  {filled && <span style={{ fontSize }}>🌱</span>}
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {streak === 0
              ? "Every time you eat, it counts 🌱"
              : `${streak} day${streak !== 1 ? "s" : ""} of showing up for yourself`}
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Intercept ────────────────────────────────────────────────────────────────

function naturalFood(name: string) {
  const lower = name.toLowerCase();
  const startsWithArticle = /^(a|an|the)\s/i.test(lower);
  return startsWithArticle ? lower : `some ${lower}`;
}

function pickRandom<T>(arr: T[], exclude?: T): T {
  const pool = arr.length > 1 && exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function InterceptScreen({ onAte, onNotNow, foods }: {
  onAte: () => void; onNotNow: () => void; foods: SafeFood[];
}) {
  const selected = foods.filter((f) => f.selected);
  const pool = selected.length > 0 ? selected : foods;
  const [suggestion, setSuggestion] = useState<SafeFood>(() => pickRandom(pool));
  const [key, setKey] = useState(0);

  function swapSuggestion() {
    setSuggestion((prev) => pickRandom(pool, prev));
    setKey((k) => k + 1);
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-5 rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "linear-gradient(135deg, rgba(243,201,168,0.25), rgba(183,196,176,0.2))" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>
          <Bell size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-0.5">Tend · just now</p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            It's been a while — how about {naturalFood(suggestion.name)}? {suggestion.emoji}
          </p>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }} className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col p-7">
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Making space to eat</p>
            <h2 className="text-2xl font-extrabold text-foreground leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No thinking required.
            </h2>
            <AnimatePresence mode="wait">
              <motion.div key={key}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="w-full rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "linear-gradient(135deg, rgba(243,201,168,0.3), rgba(232,150,122,0.12))" }}>
                <span className="text-5xl">{suggestion.emoji}</span>
                <div className="text-left">
                  <p className="font-extrabold text-foreground text-xl">{suggestion.name}</p>
                  <p className="text-sm text-muted-foreground">One of your easy foods</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set your own pace.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <PrimaryButton onClick={onAte}>Ate it ✓</PrimaryButton>
            <button onClick={swapSuggestion}
              className="w-full py-3 px-5 rounded-2xl text-sm font-semibold text-foreground border border-border bg-card transition-all active:scale-[0.97]">
              Show me something else
            </button>
            <GhostButton onClick={onNotNow} className="w-full text-center">Not now · I'll eat later</GhostButton>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Log ──────────────────────────────────────────────────────────────────────

function LogScreen({ onDone, onBack, foods }: {
  onDone: (entry: { food: string; emoji: string; note: string; photoUrl?: string }) => void;
  onBack: () => void;
  foods: SafeFood[];
}) {
  const [logged, setLogged] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [note, setNote] = useState("");

  const safeFoods = foods.filter((f) => f.selected);
  const selectedFood = safeFoods.find((f) => f.id === selectedId);

  function handleLog() {
    setLogged(true);
    const entry = {
      food: selectedFood?.name ?? "A meal",
      emoji: selectedFood?.emoji ?? "🍽️",
      note,
      photoUrl: hasPhoto && selectedFood
        ? `https://images.unsplash.com/photo-1514995428455-447d4443fa7f?w=600&h=400&fit=crop&auto=format`
        : undefined,
    };
    setTimeout(() => onDone(entry), 1600);
  }

  if (logged) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-7 pb-8">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }} className="text-center flex flex-col items-center gap-5">
          <motion.div animate={{ rotate: [0, -10, 10, -6, 6, 0] }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl">{selectedFood?.emoji ?? "🍽️"}</motion.div>
          <h2 className="text-2xl font-extrabold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nice, that's you looked after.</h2>
          <p className="text-muted-foreground text-base leading-relaxed">Every bite counts. You showed up for yourself.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-6 pt-4 pb-4 shrink-0">
        <button onClick={onBack} className="text-muted-foreground"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-extrabold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log a meal</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-6">
        <Card className="p-6 text-center flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground font-semibold">One tap is always enough</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleLog}
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center text-white"
            style={{ background: "linear-gradient(145deg, #F3C9A8, #E8967A)", boxShadow: "0 10px 32px rgba(232,150,122,0.38)" }}>
            <span className="text-4xl mb-1">✓</span>
            <span className="font-extrabold text-base">I ate</span>
          </motion.button>
          <p className="text-xs text-muted-foreground">Tap above to log — that's it</p>
        </Card>

        <div>
          <p className="text-sm font-bold text-foreground mb-1">Which one did you have?</p>
          <p className="text-xs text-muted-foreground mb-3">Totally optional — just for your journal</p>
          <div className="grid grid-cols-2 gap-2.5">
            {safeFoods.map((food) => (
              <button key={food.id} onClick={() => setSelectedId(selectedId === food.id ? null : food.id)}
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${selectedId === food.id ? "border-primary bg-accent/25 text-foreground" : "border-border bg-card text-muted-foreground"}`}>
                <span className="text-xl">{food.emoji}</span>
                <span className="text-sm font-semibold leading-tight flex-1">{food.name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedId && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-bold text-foreground mb-2">Add a note <span className="text-muted-foreground font-normal">(optional)</span></p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? Anything on your mind..."
              className="w-full rounded-2xl p-4 text-sm text-foreground resize-none outline-none bg-card border border-border placeholder:text-muted-foreground/60 focus:border-primary/40 transition-colors"
              rows={2} />
          </motion.div>
        )}

        <button onClick={() => setHasPhoto(!hasPhoto)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all w-full text-left ${hasPhoto ? "border-primary bg-accent/20" : "border-dashed border-border"}`}>
          <span className="text-2xl">📷</span>
          <div>
            <p className={`font-semibold text-sm ${hasPhoto ? "text-foreground" : "text-muted-foreground"}`}>
              {hasPhoto ? "Photo added ✓" : "Snap it? (completely optional)"}
            </p>
          </div>
        </button>

        {(selectedId || hasPhoto) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <PrimaryButton onClick={handleLog}>Log it →</PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Celebration ──────────────────────────────────────────────────────────────

function CelebrationScreen({ onDone, streak }: { onDone: () => void; streak: number }) {
  const petals = Array.from({ length: 16 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6,
    color: ["#F3C9A8", "#E8967A", "#B7C4B0", "#C6BCD6", "#FDE8D8"][i % 5],
    size: 8 + Math.random() * 10,
  }));
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-7 pb-8 relative overflow-hidden">
      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(243,201,168,0.5), transparent)" }} />
      {petals.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: "-8px", width: p.size, height: p.size, background: p.color }}
          animate={{ y: "110vh", rotate: 360, opacity: [1, 0.5] }}
          transition={{ duration: 2.8, delay: p.delay, ease: "easeIn" }} />
      ))}
      <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        className="text-center flex flex-col items-center gap-5">
        <motion.div animate={{ rotate: [0, -8, 8, -5, 5, 0] }} transition={{ duration: 1, delay: 0.3 }}
          className="text-7xl">🌸</motion.div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold text-foreground leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            You're someone who takes care of yourself.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            That's worth celebrating — no matter how small it felt.
          </p>
        </div>
        <div className="w-full rounded-2xl p-4 flex flex-col items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(243,201,168,0.2), rgba(198,188,214,0.15))" }}>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, type: "spring" }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }}>🌱</motion.div>
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {streak} day{streak !== 1 ? "s" : ""} of showing up for yourself
          </p>
        </div>
        <div className="w-full mt-2">
          <PrimaryButton onClick={onDone}>Back home</PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Journal ──────────────────────────────────────────────────────────────────

// Week strip — 7 days ending today
function WeekStrip({ entries, selectedIdx, onSelect }: {
  entries: JournalEntry[];
  selectedIdx: number | null;
  onSelect: (i: number) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const LABELS = ["M", "T", "W", "T", "F", "S", "S"];
  // map each day's date string to whether it has entries
  const hasEntry = new Set(entries.map((e) => e.timestamp.toDateString()));

  return (
    <div className="flex gap-1.5 px-6 py-3 shrink-0">
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        const isSelected = selectedIdx === i;
        const hasMeal = hasEntry.has(d.toDateString());
        return (
          <button key={i} onClick={() => onSelect(i)}
            className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-2xl transition-all"
            style={
              isSelected
                ? { background: "linear-gradient(135deg, #F3C9A8, #E8967A)" }
                : isToday
                ? { boxShadow: "inset 0 0 0 1.5px rgba(232,150,122,0.55)" }
                : {}
            }>
            <span className={`text-[11px] font-bold ${isSelected ? "text-white" : "text-muted-foreground"}`}>
              {LABELS[(d.getDay() + 6) % 7]}
            </span>
            <span className={`text-sm font-extrabold ${isSelected ? "text-white" : isToday ? "text-primary" : "text-foreground"}`}>
              {d.getDate()}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full transition-all ${hasMeal ? (isSelected ? "bg-white/80" : "bg-primary") : "bg-transparent"}`} />
          </button>
        );
      })}
    </div>
  );
}

// Photo card — tall, image-first
function PhotoCard({ entry, onClick }: { entry: JournalEntry; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className="rounded-[1.75rem] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      style={{ boxShadow: "0 4px 24px rgba(58,52,47,0.09)" }}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden" style={{ background: entry.accentColor + "40" }}>
        <img src={entry.photoUrl} alt={entry.food} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(58,52,47,0.55) 0%, transparent 55%)" }} />
        {/* Overlay text */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-extrabold text-lg leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{entry.food}</p>
          <p className="text-white/75 text-xs font-semibold mt-0.5">{formatTime(entry.timestamp)}</p>
        </div>
      </div>
      {/* Note strip */}
      {entry.note && (
        <div className="bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{entry.note}"</p>
        </div>
      )}
      {!entry.note && <div className="bg-card px-4 py-2.5 flex items-center gap-1.5">
        <Camera size={12} className="text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground/50">photo saved</span>
      </div>}
    </motion.div>
  );
}

// Compact card — horizontal, emoji left
function CompactCard({ entry, onClick, delay = 0 }: { entry: JournalEntry; onClick: () => void; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={onClick}
      className="bg-card rounded-[1.75rem] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex"
      style={{ boxShadow: "0 4px 20px rgba(58,52,47,0.07)" }}>
      {/* Accent bar + emoji */}
      <div className="w-16 shrink-0 flex items-center justify-center text-3xl"
        style={{ background: entry.accentColor + "50", minHeight: "76px" }}>
        {entry.emoji}
      </div>
      <div className="flex-1 px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-bold text-foreground text-base">{entry.food}</p>
          <span className="text-xs text-muted-foreground shrink-0">{formatTime(entry.timestamp)}</span>
        </div>
        {entry.note
          ? <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{entry.note}</p>
          : <p className="text-sm text-muted-foreground/40 mt-0.5">No note</p>}
      </div>
    </motion.div>
  );
}

// Entry detail overlay
function EntryDetail({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const [editNote, setEditNote] = useState(entry.note);
  const [editing, setEditing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(58,52,47,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-t-[2.5rem] overflow-hidden"
        style={{ maxHeight: "75%" }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Image or emoji hero */}
        {entry.photoUrl
          ? <div className="h-52 overflow-hidden relative">
              <img src={entry.photoUrl} alt={entry.food} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(250,246,241,0.9) 0%, transparent 50%)" }} />
            </div>
          : <div className="h-32 flex items-center justify-center text-7xl"
              style={{ background: `linear-gradient(135deg, ${entry.accentColor}40, ${entry.accentColor}20)` }}>
              {entry.emoji}
            </div>}

        <div className="px-6 pb-8 pt-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{entry.food}</h2>
              <span className="text-sm text-muted-foreground font-semibold">{formatTime(entry.timestamp)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {entry.timestamp.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Note */}
          <div className="rounded-2xl p-4" style={{ background: entry.accentColor + "30" }}>
            {editing
              ? <textarea autoFocus value={editNote} onChange={(e) => setEditNote(e.target.value)}
                  className="w-full bg-transparent text-sm text-foreground resize-none outline-none leading-relaxed"
                  rows={3} placeholder="Add a note..." />
              : <p className={`text-sm leading-relaxed ${editNote ? "text-foreground italic" : "text-muted-foreground/60"}`}>
                  {editNote ? `"${editNote}"` : "No note yet — tap to add one"}
                </p>}
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 mt-2 text-xs font-bold text-muted-foreground">
              <Pencil size={11} />
              {editing ? "Done" : "Edit note"}
            </button>
          </div>

          <button onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold text-base text-muted-foreground bg-muted/40">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Empty day state
function EmptyDay() {
  return (
    <div className="flex flex-col items-center py-6 gap-3">
      <div className="text-5xl opacity-40">🌿</div>
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        A quiet day — that's okay too.
      </p>
    </div>
  );
}

// Main Journal screen
function JournalScreen({ entries }: { entries: JournalEntry[] }) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(6); // today
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);
  const dayRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const grouped = groupByDay(entries);

  // Build 7-day window for the week strip
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  function handleDaySelect(i: number) {
    setSelectedDayIdx(i);
    const targetDate = weekDays[i];
    const key = targetDate.toDateString();
    const el = dayRefs.current.get(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const totalThisWeek = entries.filter((e) => {
    const diff = (today.getTime() - e.timestamp.getTime()) / 86400000;
    return diff < 7;
  }).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-4 pb-1 shrink-0">
        <h1 className="text-2xl font-extrabold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Journal 📖</h1>
        <p className="text-xs text-muted-foreground mt-0.5">A gentle record of your days</p>
      </div>

      {/* Week strip */}
      <WeekStrip entries={entries} selectedIdx={selectedDayIdx} onSelect={handleDaySelect} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="text-6xl">🌱</div>
            <h3 className="text-lg font-bold text-foreground"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your journal is empty</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you log a meal, it'll appear here as a gentle record of your days.
            </p>
          </div>
        )}

        {grouped.map((day) => {
          const key = day.date.toDateString();
          return (
            <div key={key} ref={(el) => { if (el) dayRefs.current.set(key, el); }} className="mb-7">
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3 sticky top-0 py-1 z-10"
                style={{ background: "rgba(250,246,241,0.92)", backdropFilter: "blur(8px)" }}>
                <span className="text-sm font-extrabold text-foreground">{day.label}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-semibold">
                  {day.entries.length} {day.entries.length === 1 ? "meal" : "meals"}
                </span>
              </div>

              {/* Entries — first photo entry gets full card, rest compact */}
              <div className="flex flex-col gap-3">
                {day.entries.map((entry, i) => (
                  entry.photoUrl && i === 0
                    ? <PhotoCard key={entry.id} entry={entry} onClick={() => setDetailEntry(entry)} />
                    : <CompactCard key={entry.id} entry={entry} onClick={() => setDetailEntry(entry)} delay={i * 0.05} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Weekly reflection */}
        {grouped.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5" style={{ background: "linear-gradient(135deg, rgba(183,196,176,0.25), rgba(198,188,214,0.2))" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-primary" />
                <span className="font-bold text-foreground text-sm">This week</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {totalThisWeek > 0
                  ? <>A week of showing up for yourself — <strong className="text-foreground">{totalThisWeek} meals</strong> logged with care. 🌿</>
                  : "This is a new week. Every day is a fresh start."}
              </p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {detailEntry && (
          <EntryDetail entry={detailEntry} onClose={() => setDetailEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Safe Foods ───────────────────────────────────────────────────────────────

function SafeFoodsScreen({ foods, toggleFood, addFood, removeFood }: {
  foods: SafeFood[]; toggleFood: (id: string) => void; addFood: (name: string) => void; removeFood: (id: string) => void;
}) {
  const [newFood, setNewFood] = useState("");
  const [editing, setEditing] = useState(false);
  const sorted = [...foods].sort((a, b) => {
    if (a.selected !== b.selected) return a.selected ? -1 : 1;
    return b.useCount - a.useCount;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-3 shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Safe foods 🧺</h1>
          <p className="text-sm text-muted-foreground mt-0.5">The things you can always manage</p>
        </div>
        <button onClick={() => setEditing((e) => !e)}
          className="mt-1 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all"
          style={{ color: editing ? "#E8967A" : "var(--muted-foreground)", background: editing ? "rgba(232,150,122,0.12)" : "transparent" }}>
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((food) => (
            <div key={food.id} className="relative">
              <button onClick={() => !editing && toggleFood(food.id)}
                className={`w-full flex items-center gap-2 p-3.5 rounded-2xl border-2 text-left transition-all ${food.selected ? "border-primary bg-accent/25" : "border-border bg-card text-muted-foreground"} ${editing ? "opacity-70" : ""}`}>
                <span className="text-xl">{food.emoji}</span>
                <span className={`text-sm font-semibold flex-1 leading-tight ${food.selected ? "text-foreground" : ""}`}>{food.name}</span>
                {!editing && (
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${food.selected ? "border-primary" : "border-muted-foreground/40"}`}
                    style={food.selected ? { background: "linear-gradient(135deg, #F3C9A8, #E8967A)" } : {}}>
                    {food.selected && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {editing && (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    onClick={() => removeFood(food.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: "#E8967A" }}>
                    <X size={12} strokeWidth={3} className="text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-6 pt-3 shrink-0 border-t border-border bg-background">
        <p className="text-xs font-bold text-muted-foreground mb-1">Not on your list?</p>
        <p className="text-xs text-muted-foreground mb-3">Add anything that feels easy and safe for you.</p>
        <FoodInput
          value={newFood}
          onChange={setNewFood}
          onAdd={(v) => { addFood(v); setNewFood(""); }}
          placeholder="e.g. Miso soup, rice cakes..."
        />
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsScreen({ mode, setMode }: { mode: ReminderMode; setMode: (m: ReminderMode) => void }) {
  const [gentleFreq, setGentleFreq] = useState<"soft" | "occasional" | "minimal">("soft");
  const [calendarAware, setCalendarAware] = useState(false);
  const [bodyDouble, setBodyDouble] = useState(false);
  const [buddy, setBuddy] = useState(false);

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-primary" : "bg-muted"}`}>
        <motion.div animate={{ x: on ? 24 : 2 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow" />
      </button>
    );
  }

  function RadioRow({ label, sub, checked, onSelect }: { label: string; sub: string; checked: boolean; onSelect: () => void }) {
    return (
      <button onClick={onSelect} className="flex items-center gap-3 w-full text-left">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? "border-primary" : "border-muted-foreground/40"}`}
          style={checked ? { background: "linear-gradient(135deg, #F3C9A8, #E8967A)" } : {}}>
          {checked && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sub}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-3 shrink-0">
        <h1 className="text-2xl font-extrabold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Everything on your terms</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Reminder timing</p>
          <Card className="p-5 flex flex-col gap-5">
            <RadioRow label="Around mealtimes" sub="Soft nudge at breakfast, lunch & dinner windows" checked={mode === "mealtimes"} onSelect={() => setMode("mealtimes")} />
            <div className="h-px bg-border" />
            <RadioRow label="When it's been a while" sub="Only checks in after several hours pass since you last ate" checked={mode === "elapsed"} onSelect={() => setMode("elapsed")} />
          </Card>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">How often</p>
          <Card className="p-5 flex flex-col gap-5">
            <RadioRow label="Soft & present" sub="Check in gently throughout the day" checked={gentleFreq === "soft"} onSelect={() => setGentleFreq("soft")} />
            <div className="h-px bg-border" />
            <RadioRow label="Occasional" sub="Just once or twice — easy to ignore" checked={gentleFreq === "occasional"} onSelect={() => setGentleFreq("occasional")} />
            <div className="h-px bg-border" />
            <RadioRow label="Minimal" sub="Only when I really haven't eaten" checked={gentleFreq === "minimal"} onSelect={() => setGentleFreq("minimal")} />
          </Card>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Calendar awareness</p>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: calendarAware ? "linear-gradient(135deg, #F3C9A8, #E8967A)" : "#F0E8DF" }}>
                <CalendarOff size={18} className={calendarAware ? "text-white" : "text-muted-foreground"} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Don't nudge me mid-meeting</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Tend checks your calendar and stays quiet during busy blocks</p>
              </div>
              <Toggle on={calendarAware} onToggle={() => setCalendarAware(!calendarAware)} />
            </div>
          </Card>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Soft social layer</p>
          <p className="text-xs text-muted-foreground mb-3">Opt-in only — support, never surveillance</p>
          <div className="flex flex-col gap-3">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: bodyDouble ? "linear-gradient(135deg, #C6BCD6, #B7C4B0)" : "#F0E8DF" }}>
                  <Waves size={18} className={bodyDouble ? "text-white" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Body-double feel</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">See a quiet ambient signal when others in your group are eating lunch. No names, no details.</p>
                </div>
                <Toggle on={bodyDouble} onToggle={() => setBodyDouble(!bodyDouble)} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: buddy ? "linear-gradient(135deg, #F3C9A8, #E8967A)" : "#F0E8DF" }}>
                  <UserCheck size={18} className={buddy ? "text-white" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Accountability buddy</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">A trusted person gets a soft, supportive nudge if you haven't eaten in a while. You're always in control of what they see.</p>
                  {buddy && <button className="text-xs font-bold text-primary mt-2">Invite a buddy →</button>}
                </div>
                <Toggle on={buddy} onToggle={() => setBuddy(!buddy)} />
              </div>
            </Card>
          </div>
        </div>
        <Card className="p-5" style={{ background: "linear-gradient(135deg, rgba(243,201,168,0.18), rgba(183,196,176,0.18))" }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-primary" fill="#E8967A" />
            <span className="font-bold text-foreground text-sm">About Tend</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built for anyone who struggles to eat — not to track, judge, or gamify your meals. Just gentle support, always on your side.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding-0");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("elapsed");
  const [foods, setFoods] = useState<SafeFood[]>(INITIAL_FOODS);
  const [streak, setStreak] = useState(4);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(SEED_ENTRIES);

  function toggleFood(id: string) {
    setFoods((fs) => fs.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
  }

  function removeFood(id: string) {
    setFoods((fs) => fs.filter((f) => f.id !== id));
  }

  function addFood(name: string) {
    setFoods((fs) => [...fs, { id: `c-${Date.now()}`, name, emoji: pickEmoji(name), selected: true, useCount: 0 }]);
  }

  function addJournalEntry(e: { food: string; emoji: string; note: string; photoUrl?: string }) {
    const colorIdx = journalEntries.length % ACCENT_COLORS.length;
    setJournalEntries((prev) => [
      { id: `j-${Date.now()}`, food: e.food, emoji: e.emoji, timestamp: new Date(), note: e.note, photoUrl: e.photoUrl, accentColor: ACCENT_COLORS[colorIdx] },
      ...prev,
    ]);
    const todayStr = new Date().toDateString();
    if (lastStreakDate !== todayStr) {
      setStreak((s) => s + 1);
      setLastStreakDate(todayStr);
    }
  }

  function go(s: Screen) { setScreen(s); }

  const mainScreens: Screen[] = ["home", "journal", "safe-foods", "settings"];

  return (
    <PhoneShell>
      <AnimatePresence mode="wait">
        <motion.div key={screen}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.26, ease: "easeInOut" }}
          className="flex-1 flex flex-col overflow-hidden">

          {screen === "onboarding-0" && <OnboardingWelcome onNext={() => go("onboarding-1")} />}
          {screen === "onboarding-1" && <OnboardingDayStart onNext={() => go("onboarding-2")} onBack={() => go("onboarding-0")} />}
          {screen === "onboarding-2" && <OnboardingTimingStyle onNext={() => go("onboarding-3")} onBack={() => go("onboarding-1")} mode={reminderMode} setMode={setReminderMode} />}
          {screen === "onboarding-3" && <OnboardingSafeFoods onDone={() => go("home")} onBack={() => go("onboarding-2")} foods={foods} toggleFood={toggleFood} addFood={addFood} />}
          {screen === "home" && <HomeScreen onAte={() => go("log")} onIntercept={() => go("intercept")} streak={streak} mode={reminderMode} />}
          {screen === "intercept" && <InterceptScreen onAte={() => go("log")} onNotNow={() => go("home")} foods={foods} />}
          {screen === "log" && (
            <LogScreen
              onDone={(entry) => { addJournalEntry(entry); go("celebration"); }}
              onBack={() => go("home")}
              foods={foods}
            />
          )}
          {screen === "celebration" && <CelebrationScreen onDone={() => go("home")} streak={streak} />}
          {screen === "journal" && <JournalScreen entries={journalEntries} />}
          {screen === "safe-foods" && <SafeFoodsScreen foods={foods} toggleFood={toggleFood} addFood={addFood} removeFood={removeFood} />}
          {screen === "settings" && <SettingsScreen mode={reminderMode} setMode={setReminderMode} />}
        </motion.div>
      </AnimatePresence>

      {mainScreens.includes(screen) && <BottomNav active={screen} onNavigate={go} />}
    </PhoneShell>
  );
}
