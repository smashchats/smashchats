import React, { type PropsWithChildren } from "react";
import { DimensionValue, TextStyle, View, Text as NativeText } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & TextStyle
>;

export default function Text({
    children,
    flex,
    bg,
    h,
    width,
    marginLeft,
    flexDirection,
    paddingHorizontal,
    paddingVertical,
    marginHorizontal,
    color,
    position,
    textShadowColor,
    textShadowOffset,
    textShadowRadius,
    textTransform,
    ...rest
}: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg,
                height: h,
                flex,
                width,
                marginHorizontal,
                marginLeft,
                flexDirection,
                paddingHorizontal,
                paddingVertical,
                position,
            }}
        >
            <NativeText
                style={{
                    color: color ?? "white",
                    textTransform,
                    textShadowColor,
                    textShadowOffset,
                    textShadowRadius,
                    ...rest,
                }}
            >
                {children}
            </NativeText>
        </View>
    );
}
