import React, { type PropsWithChildren } from "react";
import { DimensionValue, View } from "react-native";

type Props = PropsWithChildren<{
    flex?: number;
    bg?: string;
    h?: DimensionValue;
    mr?: DimensionValue;
    marginBottom?: number;
}>;

export function StyledBadge({
    children,
    flex,
    bg,
    h,
    marginBottom,
    mr,
}: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg,
                height: h,
                flex,
                marginBottom,
                marginRight: mr,
            }}
        >
            {children}
        </View>
    );
}
