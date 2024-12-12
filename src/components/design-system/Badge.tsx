import { Colors } from "@/src/constants/Colors.js";

import React, { type PropsWithChildren } from "react";
import { DimensionValue, View, StyleSheet, ViewStyle } from "react-native";

type Props = PropsWithChildren<
    {
        flex?: number;
        type?: string;
        bg?: string;
        bgColor?: string;
        size?: string;
        h?: DimensionValue;
    } & ViewStyle
>;

export function Badge({
    children,
    size,
    flex,
    bg,
    h,
    width,
    marginHorizontal,
    marginRight,
    paddingHorizontal,
    type,
    borderRadius,
    borderColor,
    bgColor,
    borderWidth,
    ...rest
}: Props): JSX.Element {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                paddingHorizontal: 8,
                paddingVertical: 1,

                height: h,
                flex,
                width,
                marginHorizontal,
                marginRight,

                ...styles.unselected,
                ...(type === "unselected" ? styles.unselected : {}),
                ...(type === "trusted" ? styles.trusted : {}),
                ...(type === "smashed" ? styles.smashed : {}),

                ...(borderWidth && { borderWidth }),
                ...(borderColor && { borderColor }),
                ...((bg || bgColor) && { backgroundColor: bg ?? bgColor }),
                ...(borderRadius && { borderRadius }),
                ...rest,
            }}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    smashed: {
        backgroundColor: Colors.purple,
        borderColor: Colors.purple,
        borderWidth: 2,
        // marginLeft: 30
    },
    trusted: {
        backgroundColor: "#3f3f3f",
        borderColor: "#3f3f3f",
        borderWidth: 2,
    },
    unselected: {
        backgroundColor: Colors.background,
        borderColor: Colors.purple,
        borderWidth: 2,
    },
});
