/** @type{import("@storybook/react-native").StorybookConfig} */
module.exports = {
    stories: ["../src/ui/**/*.stories.?(ts|tsx|js|jsx)"],
    addons: [
        "@storybook/addon-ondevice-controls",
        "@storybook/addon-ondevice-actions",
    ],
};
