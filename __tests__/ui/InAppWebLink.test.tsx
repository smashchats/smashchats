import * as React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import * as WebBrowser from "expo-web-browser";

import { InAppWebLink } from "@/src/ui/components/InAppWebLink/InAppWebLink";

jest.mock("expo-web-browser", () => ({
    openBrowserAsync: jest.fn(),
}));

it(`renders correctly and opens the browser on press`, async () => {
    const url = "https://example.com";
    const { getByText } = render(<InAppWebLink url={url} text="Open Link" />);

    const link = getByText("Open Link");
    expect(link).toBeTruthy();

    fireEvent.press(link);
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(url);
});
