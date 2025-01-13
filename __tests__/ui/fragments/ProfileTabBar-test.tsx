import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ProfileTabBar } from "@/src/ui/fragments/ProfileTabs/ProfileTabBar";

describe("ProfileTabBar", () => {
    const mockNavigation = {
        emit: jest.fn(() => ({ defaultPrevented: false })),
        navigate: jest.fn(),
    };

    const defaultProps = {
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
        navigation: mockNavigation,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all tab buttons", () => {
        // @ts-expect-error
        const { getByText } = render(<ProfileTabBar {...defaultProps} />);

        expect(getByText("First")).toBeTruthy();
        expect(getByText("Second")).toBeTruthy();
        expect(getByText("Third")).toBeTruthy();
    });

    it("calls navigation.emit and navigate when pressing unfocused tab", () => {
        // @ts-expect-error
        const { getByText } = render(<ProfileTabBar {...defaultProps} />);

        fireEvent.press(getByText("Second"));

        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: "tabPress",
            target: "second",
            canPreventDefault: true,
        });
        expect(mockNavigation.navigate).toHaveBeenCalledWith(
            "Second",
            undefined
        );
    });

    it("calls navigation.emit but not navigate when pressing focused tab", () => {
        const props = {
            ...defaultProps,
            state: {
                ...defaultProps.state,
                index: 0,
            },
        };

        // @ts-expect-error
        const { getByText } = render(<ProfileTabBar {...props} />);

        fireEvent.press(getByText("First"));

        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: "tabPress",
            target: "first",
            canPreventDefault: true,
        });
        expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it("calls onIndexChange when tab index changes", () => {
        const onIndexChange = jest.fn();
        const props = {
            ...defaultProps,
            onIndexChange,
        };

        // @ts-expect-error
        const { rerender } = render(<ProfileTabBar {...props} />);

        expect(onIndexChange).toHaveBeenCalledWith(0);

        rerender(
            // @ts-expect-error
            <ProfileTabBar {...props} state={{ ...props.state, index: 1 }} />
        );

        expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it("emits tabLongPress event when long pressing a tab", () => {
        // @ts-expect-error
        const { getByText } = render(<ProfileTabBar {...defaultProps} />);

        fireEvent(getByText("Second"), "longPress");

        expect(mockNavigation.emit).toHaveBeenCalledWith({
            type: "tabLongPress",
            target: "second",
        });
    });
});
