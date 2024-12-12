import React, { type PropsWithChildren } from "react";
import { DimensionValue, FlexStyle, View } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & FlexStyle
>;

export function HStack({
    children,
    flex,
    bg,
    h,
    alignContent,
    marginBottom,
    marginHorizontal,
    marginVertical,
    justifyContent,
    alignItems,
    gap,
}: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg,
                height: h,
                flex,
                flexDirection: "row",
                alignContent,
                marginBottom,
                marginHorizontal,
                marginVertical,
                justifyContent,
                alignItems,
                gap,
            }}
        >
            {children}
        </View>
    );
}
