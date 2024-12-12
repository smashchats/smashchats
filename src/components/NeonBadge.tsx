import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { NeonText } from "@/src/components/NeonText.js";
import { Badge } from "@/src/components/design-system/Badge.js";

type Props = {
    title: string;
};

export function NeonBadge({ title }: Readonly<Props>): JSX.Element {
    return (
        <Badge
            borderRadius={16}
            bgColor={Colors.background}
            borderColor={Colors.purple}
            borderWidth={3.5}
        >
            <NeonText text={title} />
        </Badge>
    );
}
