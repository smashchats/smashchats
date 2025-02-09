import { DomainBadges } from "@/src/types/smash/badge.categories";

export const badgeData: DomainBadges[] = [
    {
        domain: "username.users.kinkverse.org",
        badges: [
            {
                id: 1,
                value: "snapchat: username",
                category: "com.smashchats.badges.socials",
            },
            {
                id: 2,
                value: "x: @username",
                verified: true,
                category: "com.smashchats.badges.socials",
            },
            {
                id: 5,
                value: "CBT",
                category: "com.smashchats.badges.interests",
            },
            {
                id: 3,
                value: "hung",
                category: "com.smashchats.badges.attributes",
                endorsements: 4,
            },
            {
                id: 4,
                value: {
                    label: "size",
                    unit: "com.smashchats.units.ft",
                    value: 6,
                },
                category: "com.smashchats.badges.attributes",
            },
            {
                id: 6,
                value: "WS",
                category: "com.smashchats.badges.interests",
                endorsements: 3,
            },
            {
                id: 7,
                value: "public",
                category: "com.smashchats.badges.interests",
            },
            {
                id: 8,
                value: "dom",
                category: "com.smashchats.badges.attributes",
            },
        ],
    },
    {
        domain: "username.u.smashchats.com",
        badges: [
            {
                id: 1,
                value: "+18",
                category: "com.smashchats.badges.verified",
                verified: true,
            },
        ],
    },
];
