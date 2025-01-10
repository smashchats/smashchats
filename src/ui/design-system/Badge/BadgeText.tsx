import React, { type PropsWithChildren } from "react";
import { DimensionValue, Text, TextStyle, View } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & TextStyle
>;

export function BadgeText({
    children,
    flex,
    bg,
    h,
    color,
    ...rest
}: Props): JSX.Element {
    return (
        <View style={{ backgroundColor: bg, height: h, flex }}>
            <Text
                style={{
                    color: color ?? "white",
                    fontFamily:
                        'Cairo, apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    fontSize: 12,
                    textTransform: "uppercase",
                    ...rest,
                }}
            >
                {children}
            </Text>
        </View>
    );
}
