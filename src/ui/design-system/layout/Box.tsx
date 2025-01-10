import React, { type PropsWithChildren } from "react";
import { DimensionValue, View, ViewStyle } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & ViewStyle
>;

export function Box({ children, bg, h, ...rest }: Props): JSX.Element {
    return (
        <View
            style={{
                backgroundColor: bg,
                height: h,
                ...rest,
            }}
        >
            {children}
        </View>
    );
}
