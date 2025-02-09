export type UnitKey = keyof typeof units;

type Unit = {
    label: string;
    type: "length";
    conversion: Record<UnitKey, (value: number) => number>;
};

export const units: Record<string, Unit> = {
    "com.smashchats.units.ft": {
        label: "ft",
        type: "length",
        conversion: {
            "com.smashchats.units.cm": (value) => value * 30.48,
        },
    },
    "com.smashchats.units.cm": {
        label: "cm",
        type: "length",
        conversion: {
            "com.smashchats.units.ft": (value) => value / 30.48,
        },
    },
};
