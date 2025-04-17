import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import ConfirmSheet from "@/src/ui/sheets/ConfirmSheet";
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

describe("ConfirmSheet", () => {
    beforeEach(() => {
        (SheetManager.hide as jest.Mock).mockClear();
    });

    test("should render correctly", () => {
        const tree = render(
            <ConfirmSheet
                sheetId="confirm-sheet"
                payload={{ message: "[TEST MESSAGE] are you sure?" }}
            />
        );

        expect(tree).toMatchSnapshot();
    });

    test("should call hideActionSheet() with false when pressed", () => {
        const tree = render(<ConfirmSheet sheetId="confirm-sheet" />);

        const closeActionSheetButton = tree.getByTestId("confirmSheetNoButton");

        fireEvent(closeActionSheetButton, "press");

        expect(SheetManager.hide).toHaveBeenCalledWith("confirm-sheet", {
            payload: false,
        });
    });

    test("should call hideActionSheet() with true when pressed", () => {
        const tree = render(<ConfirmSheet sheetId="confirm-sheet" />);

        const closeActionSheetButton = tree.getByTestId(
            "confirmSheetYesButton"
        );

        fireEvent(closeActionSheetButton, "press");

        expect(SheetManager.hide).toHaveBeenCalledWith("confirm-sheet", {
            payload: true,
        });
    });
});
