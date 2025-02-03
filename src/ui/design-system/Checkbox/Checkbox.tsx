import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors";

export interface Props {
    checked: boolean;
}

export const Checkbox = ({ checked }: Readonly<Props>) => {
    return (
        <View>
            {checked ? (
                <MaterialCommunityIcons
                    name="check-circle"
                    size={28}
                    color={Colors.purple}
                />
            ) : (
                <MaterialCommunityIcons
                    name="circle-outline"
                    size={28}
                    color={Colors.purple}
                />
            )}
        </View>
    );
};
