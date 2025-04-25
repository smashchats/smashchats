import * as React from "react";
import { render } from "@testing-library/react-native";

import { ThemedText } from "@/src/ui/components/ThemedText";

it(`renders correctly`, () => {
    const tree = render(<ThemedText>Snapshot test!</ThemedText>).toJSON();

    expect(tree).toMatchSnapshot();
});

describe("ThemedText with custom color", () => {
    it(`renders correctly with a light theme custom color`, () => {
        const tree = render(
            <ThemedText lightColor="red" darkColor="blue">
                Snapshot test!
            </ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});

describe("ThemedText with type", () => {
    it(`renders correctly with type title`, () => {
        const tree = render(
            <ThemedText type="title">Snapshot test!</ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
    it(`renders correctly with type subtitle`, () => {
        const tree = render(
            <ThemedText type="subtitle">Snapshot test!</ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it(`renders correctly with type link`, () => {
        const tree = render(
            <ThemedText type="link">Snapshot test!</ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it(`renders correctly with type default`, () => {
        const tree = render(
            <ThemedText type="default">Snapshot test!</ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it(`renders correctly with type defaultSemiBold`, () => {
        const tree = render(
            <ThemedText type="defaultSemiBold">Snapshot test!</ThemedText>
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
