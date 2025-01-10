import React, { type PropsWithChildren } from "react";
import { DimensionValue, FlexStyle, View } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & FlexStyle
>;

export function VStack({
    children,
    flex,
    bg,
    h,
    gap,
    marginHorizontal,
    marginVertical,
    alignItems,
    ...rest
}: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg,
                height: h,
                gap,
                flex,
                marginHorizontal,
                alignItems,
                marginVertical,
                flexDirection: "column",
                ...rest,
            }}
        >
            {children}
        </View>
    );
}
