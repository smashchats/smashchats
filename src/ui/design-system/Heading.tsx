import React, { type PropsWithChildren } from "react";
import { DimensionValue, View, Text, TextStyle } from "react-native";

type Props = PropsWithChildren<
    {
        flex?: number;
        bg?: string;
        h?: DimensionValue;
        style?: any;
        isTruncated?: boolean;
    } & TextStyle
>;

export function Heading({
    children,
    style,
    flex,
    bg,
    h,
    fontWeight,
    marginBottom,
    isTruncated,
    color,
    fontSize,
    fontFamily,
}: Props): JSX.Element {
    return (
        <View style={{ backgroundColor: bg, height: h, flex, marginBottom }}>
            <Text
                numberOfLines={isTruncated ? 2 : undefined}
                style={{
                    color: color ?? "white",
                    fontWeight,
                    fontSize,
                    fontFamily,
                    ...style,
                }}
            >
                {children}
            </Text>
        </View>
    );
}
