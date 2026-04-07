import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBolt,
  faCrown,
  faFire,
  faGhost,
  faMedal,
  faMinus,
  faSeedling,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

type BadgeRule = {
  minHours: number;
  label: string;
  className: string;
  icon: IconDefinition;
};

export type BadgeInfo = Omit<BadgeRule, "minHours">;

const BADGE_RULES: BadgeRule[] = [
  {
    minHours: 160,
    label: "MISSION IMPOSSIBLE",
    className: "badge-impossible",
    icon: faGhost,
  },
  {
    minHours: 130,
    label: "GOD LEVEL",
    className: "badge-god",
    icon: faCrown,
  },
  {
    minHours: 100,
    label: "STARLIGHT",
    className: "badge-starlight",
    icon: faStar,
  },
  {
    minHours: 50,
    label: "ELITE",
    className: "badge-elite",
    icon: faFire,
  },
  {
    minHours: 20,
    label: "PRO",
    className: "badge-pro",
    icon: faBolt,
  },
  {
    minHours: 5,
    label: "NOVICE",
    className: "badge-novice",
    icon: faMedal,
  },
  {
    minHours: 1,
    label: "NEWBIE",
    className: "badge-newbie",
    icon: faSeedling,
  },
];

const DEFAULT_BADGE: BadgeInfo = {
  label: "NONE",
  className: "badge-none",
  icon: faMinus,
};

export const BADGE_LEGEND_HOURS = [160, 130, 100, 50, 20, 5, 1, 0];

export function getBadgeInfoFromHours(hours: number): BadgeInfo {
  const safeHours = Number.isFinite(hours) ? hours : 0;

  const matched = BADGE_RULES.find((rule) => safeHours >= rule.minHours);
  if (!matched) return DEFAULT_BADGE;

  return {
    label: matched.label,
    className: matched.className,
    icon: matched.icon,
  };
}