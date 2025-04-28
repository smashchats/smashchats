import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialCommunityIcon } from "@/src/ui/design-system/MaterialCommunityIconsType";
import { Colors } from "@/src/constants/Colors";

interface IconButtonProps extends TouchableOpacityProps {
  icon: MaterialCommunityIcon;
  size?: number;
  variant?: "primary" | "secondary";
  buttonSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  variant = "secondary",
  buttonSize = 45,
  style,
  ...touchableProps
}) => {
  const variantStyle =
    variant === "primary" ? styles.primary : styles.secondary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        variantStyle,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        style,
      ]}
      testID={`IconButton::${icon}`}
      {...touchableProps}
    >
      <MaterialCommunityIcons name={icon} size={size} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  primary: {
    backgroundColor: Colors.purple,
  },
  secondary: {
    backgroundColor: "rgba(0, 0, 0, 0.33)",
  },
});
