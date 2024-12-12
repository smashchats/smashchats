import React, { type PropsWithChildren } from "react";
import { View } from "react-native";

type Props = PropsWithChildren<{
    flex?: number;
    bg?: string;
    bgColor?: string;
    borderRadius?: number;
    size?: number;
}>;

export function Avatar({
    children,
    flex,
    bg,
    bgColor,
    borderRadius,
    size,
}: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg ?? bgColor,
                flex,
                minWidth: size ?? 64,
                maxWidth: size ?? 64,
                width: size ?? 64,
                minHeight: size ?? 64,
                maxHeight: size ?? 64,
                height: size ?? 64,
                borderRadius: borderRadius ?? 16,
                overflow: "hidden",
            }}
        >
            {children}
        </View>
    );
}
