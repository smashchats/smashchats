import React, { type PropsWithChildren } from "react";
import { DimensionValue, View, ViewStyle, ViewProps } from "react-native";

type Props = PropsWithChildren<
    {
        bg?: string;
        h?: DimensionValue;
    } & ViewStyle &
        ViewProps
>;

export function Box({ children, bg, h, testID, ...rest }: Props): JSX.Element {
    return (
        <View
            testID={testID}
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
