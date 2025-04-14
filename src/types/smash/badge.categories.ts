import { UnitKey } from "@/src/types/smash/units";
export { UnitKey };

export type CategoryKey = keyof typeof categories;

type Category = {
    title: string;
};

export const categories: Record<string, Category> = {
    "com.smashchats.badges.socials": {
        title: "Socials",
    },
    "com.smashchats.badges.interests": {
        title: "Interests",
    },
    "com.smashchats.badges.attributes": {
        title: "Attributes",
    },
    "com.smashchats.badges.verified": {
        title: "Verified",
    },
};

export type BadgeUnitValue = {
    label: string;
    unit: UnitKey;
    value: number;
};

export type Badge = {
    id: number;
    value: string | number | BadgeUnitValue;
    category: CategoryKey;
    endorsements?: number;
    verified?: boolean;
};

export type DomainBadges = {
    domain: string;
    badges: Badge[];
};
