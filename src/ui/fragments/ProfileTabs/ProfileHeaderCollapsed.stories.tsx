import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "../../design-system/layout";
import { ProfileHeaderCollapsed } from "./ProfileHeaderCollapsed";

const meta = {
    title: "fragments/ProfileTabs/ProfileHeader",
    component: ProfileHeaderCollapsed,
};

export default meta;

export const Collapsed = {
    render: (args: any) => {
        const { top } = useSafeAreaInsets();

        return (
            <Box alignItems="flex-start" paddingTop={top}>
                <ProfileHeaderCollapsed
                    peer={{ ...args }}
                    marginHorizontal={args.marginHorizontal}
                />
            </Box>
        );
    },
    args: {
        trusted_name: "Neighborhood Admin",
        meta_title: "John Doe",
        meta_avatar: "https://github.com/smashchats.png",
        marginHorizontal: 48,
    },
};
