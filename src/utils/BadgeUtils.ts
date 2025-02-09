import { units, UnitKey } from "@/src/types/smash/units";
import { Badge, BadgeUnitValue } from "@/src/types/smash/badge.categories";

export const badgeToString = (badge: Badge["value"], unitPreferences: Record<string, UnitKey>) => {
    if (typeof badge === "string") {
        return badge;
    }
    if (typeof badge === "number") {
        return badge.toString();
    }
    const unitKey = units[badge.unit].type;
    const unit = unitPreferences[unitKey] || badge.unit;
    const convertedValue = convertBadgeValueToUnit(badge, unit);
    return `${badge.label}: ${convertedValue} ${units[unit].label}`;
};

export const getCategories = (data: Badge[]) => {
    const out = data.map((item) => item.category);
    return [...new Set(out)];
};

export const convertBadgeValueToUnit = (
    value: BadgeUnitValue,
    unit: UnitKey
) => {
    if (value.unit === unit) {
        return value.value;
    }

    const unitValue = units[value.unit];
    const conversion = unitValue.conversion[unit];
    if (!conversion) {
        return value.value;
    }
    return conversion(value.value);
};
