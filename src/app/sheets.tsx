import { registerSheet, SheetDefinition } from "react-native-actions-sheet";

import ProfileDetailsSheet, {
    ProfileDetailsSheetProps,
} from "@/src/ui/sheets/ProfileDetailsSheet";

registerSheet("profile-details-sheet", ProfileDetailsSheet);

declare module "react-native-actions-sheet" {
    interface Sheets {
        "profile-details-sheet": SheetDefinition<{
            payload: ProfileDetailsSheetProps;
        }>;
    }
}

export {};
