import { registerSheet, SheetDefinition } from "react-native-actions-sheet";

import ProfileDetailsSheet, {
    ProfileDetailsSheetProps,
} from "@/src/ui/sheets/ProfileDetailsSheet";

import ConfirmSheet, { ConfirmSheetProps } from "@/src/ui/sheets/ConfirmSheet";
import InputFieldSheet, { InputFieldSheetProps } from "@/src/ui/sheets/InputFieldSheet";

registerSheet("profile-details-sheet", ProfileDetailsSheet);
registerSheet("confirm-sheet", ConfirmSheet);
registerSheet("input-field-sheet", InputFieldSheet);

declare module "react-native-actions-sheet" {
    interface Sheets {
        "profile-details-sheet": SheetDefinition<{
            payload: ProfileDetailsSheetProps;
        }>;
        "confirm-sheet": SheetDefinition<{
            payload: ConfirmSheetProps;
            returnValue: boolean;
        }>;
        "input-field-sheet": SheetDefinition<{
            payload: InputFieldSheetProps;
            returnValue: string | undefined;
        }>;
    }
}

export {};
