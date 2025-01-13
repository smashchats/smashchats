import { ProfileTabBar as TabBar } from "./ProfileTabBar";

const meta = {
    title: "fragments/ProfileTabs",
    component: TabBar,
    parameters: {
        layout: "centered",
    },
};

export default meta;

export const ProfileTabBar = {
    args: {
        state: {
            index: 0,
            routes: [
                { key: "first", name: "First" },
                { key: "second", name: "Second" },
                { key: "third", name: "Third" },
            ],
        },
        descriptors: {
            first: {
                key: "first",
                options: {
                    title: "First",
                },
            },
            second: {
                key: "second",
                options: {
                    title: "Second",
                },
            },
            third: {
                key: "third",
                options: {
                    title: "Third",
                },
            },
        },
        navigation: {
            emit: () => ({ defaultPrevented: false }),
            navigate: () => {},
        },
    },
};
