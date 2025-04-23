import { registerSheet, SheetDefinition } from "react-native-actions-sheet";

import ProfileDetailsSheet, {
    ProfileDetailsSheetProps,
} from "@/src/ui/sheets/ProfileDetailsSheet";
import ConfirmSheet, { ConfirmSheetProps } from "@/src/ui/sheets/ConfirmSheet";
import InputFieldSheet, {
    InputFieldSheetProps,
} from "@/src/ui/sheets/InputFieldSheet";
import BadgeDetailsSheet, {
    BadgeDetailsSheetProps,
} from "@/src/ui/sheets/BadgeDetailsSheet";
import ReportSheet, { ReportSheetProps } from "@/src/ui/sheets/ReportSheet";

registerSheet("profile-details-sheet", ProfileDetailsSheet);
registerSheet("badge-details-sheet", BadgeDetailsSheet);
registerSheet("confirm-sheet", ConfirmSheet);
registerSheet("input-field-sheet", InputFieldSheet);
registerSheet("report-sheet", ReportSheet);

declare module "react-native-actions-sheet" {
    interface Sheets {
        "profile-details-sheet": SheetDefinition<{
            payload: ProfileDetailsSheetProps;
        }>;
        "badge-details-sheet": SheetDefinition<{
            payload: BadgeDetailsSheetProps;
        }>;
        "confirm-sheet": SheetDefinition<{
            payload: ConfirmSheetProps;
            returnValue: boolean;
        }>;
        "input-field-sheet": SheetDefinition<{
            payload: InputFieldSheetProps;
            returnValue: string | undefined;
        }>;
        "report-sheet": SheetDefinition<{
            payload: ReportSheetProps;
        }>;
    }
}

export {};
