export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: string; // emoji
  condition: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    type: "first_fillup",
    name: "Premier Plein",
    description: "Enregistrez votre premier plein",
    icon: "⛽",
    condition: "1 plein enregistre",
  },
  {
    type: "saver_10",
    name: "Malin Debutant",
    description: "Economisez 10 EUR au total",
    icon: "💰",
    condition: "10 EUR economises",
  },
  {
    type: "saver_50",
    name: "Chasseur de Prix",
    description: "Economisez 50 EUR au total",
    icon: "🏆",
    condition: "50 EUR economises",
  },
  {
    type: "saver_100",
    name: "Expert Carburant",
    description: "Economisez 100 EUR au total",
    icon: "👑",
    condition: "100 EUR economises",
  },
  {
    type: "reporter_1",
    name: "Eclaireur",
    description: "Faites votre premier signalement",
    icon: "🔍",
    condition: "1 signalement",
  },
  {
    type: "reporter_10",
    name: "Sentinelle",
    description: "Faites 10 signalements",
    icon: "🛡️",
    condition: "10 signalements",
  },
  {
    type: "reporter_50",
    name: "Gardien des Prix",
    description: "Faites 50 signalements",
    icon: "⭐",
    condition: "50 signalements",
  },
  {
    type: "streak_3",
    name: "Regulier",
    description: "3 semaines de suite avec un plein",
    icon: "🔥",
    condition: "Streak de 3 semaines",
  },
  {
    type: "streak_7",
    name: "Assidu",
    description: "7 semaines de suite avec un plein",
    icon: "💎",
    condition: "Streak de 7 semaines",
  },
  {
    type: "explorer_5",
    name: "Explorateur",
    description: "Faites le plein dans 5 stations differentes",
    icon: "🗺️",
    condition: "5 stations visitees",
  },
  {
    type: "sharer_1",
    name: "Ambassadeur",
    description: "Partagez un prix pour la premiere fois",
    icon: "📢",
    condition: "1 partage",
  },
];

export const BADGE_MAP = new Map(BADGES.map((b) => [b.type, b]));

/** Calculate weekly streak from fill-up dates */
export function calculateStreak(fillUpDates: string[]): number {
  if (fillUpDates.length === 0) return 0;

  const weeks = new Set<string>();
  for (const date of fillUpDates) {
    const d = new Date(date);
    // Get ISO week identifier
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7
    );
    weeks.add(`${d.getFullYear()}-W${weekNum}`);
  }

  // Sort weeks and count consecutive from most recent
  const sortedWeeks = [...weeks].sort().reverse();
  let streak = 1;

  for (let i = 1; i < sortedWeeks.length; i++) {
    const [prevYear, prevWeek] = parseWeek(sortedWeeks[i - 1]);
    const [curYear, curWeek] = parseWeek(sortedWeeks[i]);

    const isConsecutive =
      (prevYear === curYear && prevWeek === curWeek + 1) ||
      (prevYear === curYear + 1 && prevWeek === 1 && curWeek >= 52);

    if (isConsecutive) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function parseWeek(weekStr: string): [number, number] {
  const [year, week] = weekStr.split("-W");
  return [parseInt(year), parseInt(week)];
}
