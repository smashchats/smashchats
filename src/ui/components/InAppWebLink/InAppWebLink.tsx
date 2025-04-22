import {
    StyleProp,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from "react-native";

import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/src/ui/components/ThemedText";

export function InAppWebLink({
    url,
    text,
    style,
    textStyle,
}: Readonly<{
    url: string;
    text: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}>) {
    return (
        <TouchableOpacity
            style={style}
            onPress={async () => {
                await WebBrowser.openBrowserAsync(url);
            }}
        >
            <ThemedText style={[styles.linkText, textStyle]}>{text}</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    linkText: {
        textDecorationLine: "underline",
    },
});
