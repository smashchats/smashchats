import { View } from "react-native";
import { Colors } from "@/src/constants/Colors.js";

/** @type{import("@storybook/react").Preview} */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  decorators: [
    (Story, { parameters }) => (
      <View
        style={{
          flex: 1,
          backgroundColor:
            parameters.noBackground === true ? undefined : Colors.background,
          padding: 8,
        }}
      >
        <Story />
      </View>
    ),
  ],
};

export default preview;
