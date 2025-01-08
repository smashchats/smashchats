import { useEffect, useState } from "react";

import { Keyboard } from "react-native";

export function useKeyboard() {

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const hideKeyboard = () => {
        Keyboard.dismiss();
    }

    return { Keyboard, keyboardVisible, hideKeyboard };
}
