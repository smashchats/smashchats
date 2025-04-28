import { Colors } from "@/src/constants/Colors";
import {
    AvatarFallbackText,
    AvatarImage,
    AvatarWrapper,
} from "@/src/ui/design-system/Avatar";
import { ContactPreview } from "@/src/types/Contacts.types";

type AvatarProps = {
    contact: ContactPreview;
    variant?: "small" | "medium" | "large" | "xlarge";
};

export const Avatar = ({ contact, variant = "small" }: AvatarProps) => {
    const dimensions = {
        small: 40,
        medium: 56,
        large: 64,
        xlarge: 128,
    };

    if (!contact) {
        return null;
    }

    const hasImage =
        contact.meta_avatar?.startsWith("data:image/png;base64,") ||
        contact.meta_avatar?.startsWith("data:image/jpeg;base64,") ||
        contact.meta_avatar?.startsWith("https://kinkverse.org") ||
        contact.meta_avatar?.startsWith("https://i.ytimg.com") ||
        contact.meta_avatar?.startsWith("https://upload.wiki") ||
        contact.meta_avatar?.startsWith("file://") ||
        contact.meta_avatar?.startsWith("https://github.com") ||
        contact.meta_avatar?.startsWith(
            "https://unstaticlabs.com/unstatic-logo.svg"
        );

    const avatarSize = dimensions[variant];

    return (
        <AvatarWrapper
            bgColor={Colors.purple}
            borderRadius={avatarSize / 4}
            size={avatarSize}
        >
            {!hasImage && (
                <AvatarFallbackText
                    name={contact.trusted_name ?? contact.meta_title ?? ""}
                />
            )}
            {hasImage && (
                <AvatarImage
                    transition={0}
                    alt={`${
                        contact.trusted_name ?? contact.meta_title ?? ""
                    }'s avatar'`}
                    borderRadius={avatarSize / 4}
                    size={avatarSize}
                    source={contact.meta_avatar}
                />
            )}
        </AvatarWrapper>
    );
};
