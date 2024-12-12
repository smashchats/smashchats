import React, { type PropsWithChildren } from "react";
import { ViewStyle } from "react-native";
import { Image, ImageSource } from "expo-image";

type Props = PropsWithChildren<
    {
        source?:
            | ImageSource
            | string
            | number
            | ImageSource[]
            | string[]
            | null;
        alt?: string;
        size?: number;
    } & ViewStyle
>;

export function AvatarImage({ source, alt, size }: Props): JSX.Element {
    return (
        <Image
            style={{
                minWidth: size ?? 64,
                maxWidth: size ?? 64,
                width: size ?? 64,
                minHeight: size ?? 64,
                maxHeight: size ?? 64,
                height: size ?? 64,
            }}
            source={source}
            alt={alt}
            contentFit={"contain"}
            transition={1000}
        />
    );
}
