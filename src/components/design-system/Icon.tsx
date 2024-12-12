import React, { type PropsWithChildren } from "react";
import { DimensionValue, View } from "react-native";

type Props = PropsWithChildren<{
    flex?: number;
    bg?: string;
    h?: DimensionValue;
}>;

export function Icon({ children, flex, bg, h }: Props): JSX.Element {
    return (
        <View style={{ backgroundColor: bg, height: h, flex }}>{children}</View>
    );
}
