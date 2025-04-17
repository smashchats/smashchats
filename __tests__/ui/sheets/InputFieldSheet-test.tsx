import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import InputFieldSheet from "@/src/ui/sheets/InputFieldSheet";
import { SheetManager } from "react-native-actions-sheet";

jest.mock("react-native-actions-sheet", () => {
    const funcs = jest.requireActual("react-native-actions-sheet");

    return {
        __esModule: true,
        ...funcs,
        SheetManager: {
            show: funcs.SheetManager.show,
            hide: jest.fn(),
        },
        default: ({ children }: { children: React.ReactNode }) => children,
    };
});

describe("InputFieldSheet", () => {
    beforeEach(() => {
        (SheetManager.hide as jest.Mock).mockClear();
    });

    test("should render correctly", () => {
        const tree = render(
            <InputFieldSheet
                sheetId="input-field-sheet"
                payload={{ 
                    message: "[TEST MESSAGE] Enter your input",
                    subMessage: "This is a submessage",
                    placeholder: "Type here"
                }}
            />
        );

        expect(tree).toMatchSnapshot();
    });

    test("should call hideActionSheet() with undefined when cancel is pressed", () => {
        const tree = render(
            <InputFieldSheet
                sheetId="input-field-sheet"
                payload={{ message: "Enter your input" }}
            />
        );

        const cancelButton = tree.getByTestId("inputFieldSheetCancelButton");

        fireEvent(cancelButton, "press");

        expect(SheetManager.hide).toHaveBeenCalledWith("input-field-sheet", {
            payload: undefined,
        });
    });

    test("should call hideActionSheet() with input value when confirm is pressed", () => {
        const tree = render(
            <InputFieldSheet
                sheetId="input-field-sheet"
                payload={{ message: "Enter your input" }}
            />
        );

        const input = tree.getByTestId("inputFieldSheetInput");
        const confirmButton = tree.getByTestId("inputFieldSheetConfirmButton");

        // Change the input value
        fireEvent.changeText(input, "Test Input Value");

        // Press the confirm button
        fireEvent(confirmButton, "press");

        expect(SheetManager.hide).toHaveBeenCalledWith("input-field-sheet", {
            payload: "Test Input Value",
        });
    });

    test("should render with optional subMessage when provided", () => {
        const tree = render(
            <InputFieldSheet
                sheetId="input-field-sheet"
                payload={{ 
                    message: "Enter your input",
                    subMessage: "This is a submessage"
                }}
            />
        );

        expect(tree.getByText("This is a submessage")).toBeTruthy();
    });

    test("should render with placeholder when provided", () => {
        const tree = render(
            <InputFieldSheet
                sheetId="input-field-sheet"
                payload={{ 
                    message: "Enter your input",
                    placeholder: "Type here"
                }}
            />
        );

        const input = tree.getByTestId("inputFieldSheetInput");
        expect(input.props.placeholder).toBe("Type here");
    });
}); 