import { Box } from "@/src/ui/design-system/layout";
import { ProfileHeaderExpanded } from "./ProfileHeaderExpanded";

const meta = {
    title: "fragments/ProfileTabs/ProfileHeader",
    component: ProfileHeaderExpanded,
};

export default meta;

export const Expanded = {
    render: (args: any) => {
        return (
            <Box
                alignItems="flex-start"
                position="absolute"
                top={0}
                left={0}
                right={0}
            >
                <ProfileHeaderExpanded peer={{ ...args }} />
            </Box>
        );
    },
    args: {
        trusted_name: "Neighborhood Admin",
        meta_title: "John Doe",
        meta_description: "This is a description",
        meta_avatar: "https://github.com/smashchats.png",
    },
};
