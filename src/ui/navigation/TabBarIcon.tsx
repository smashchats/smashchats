// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from "@expo/vector-icons/Ionicons.js";
import { type IconProps } from "@expo/vector-icons/build/createIconSet.js";
import { type ComponentProps } from "react";

export function TabBarIcon({
    style,
    ...rest
}: // @ts-ignore
Readonly<IconProps<ComponentProps<typeof Ionicons>["name"]>>) {
    return (
        // @ts-ignore
        <Ionicons size={28} style={[{ marginBottom: -3 }, style]} {...rest} />
    );
}
