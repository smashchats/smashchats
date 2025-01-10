import React from "react";

import { Colors } from "@/src/constants/Colors.js";
import { NeonText } from "@/src/ui/components/NeonText";
import { Badge } from "@/src/ui/design-system/Badge";

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
