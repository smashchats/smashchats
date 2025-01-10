import { Linking, Text, View } from "react-native";

const StarterComponent = () => (
  <View style={{ padding: 16 }}>
    <Text style={{ color: "white" }}>
      This app uses Storybook to build components. Follow the{" "}
      <Text
        style={{
          color: "cyan",
          textDecorationLine: "underline",
          textDecorationColor: "cyan",
        }}
        onPress={() =>
          Linking.openURL(
            "https://storybook.js.org/tutorials/intro-to-storybook/react-native/en/get-started/"
          )
        }
      >
        tutorial
      </Text>{" "}
      to learn how to create your own stories.
    </Text>
  </View>
);

const meta = {
  title: "Welcome",
  component: StarterComponent,
};

export default meta;

export const GettingStarted = {
  parameters: {
    noBackground: true,
  },
};
