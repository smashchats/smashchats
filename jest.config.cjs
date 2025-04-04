/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.{ts,tsx,js,jsx}",
        "!**/*.stories.{js,jsx,ts,tsx}",
        "!**/coverage/**",
        "!**/android/**",
        "!**/ios/**",
        "!**/node_modules/**",
        "!**/babel.config.js",
        "!**/expo-env.d.ts",
        "!**/.expo/**",
        "!**/.storybook/**",
        "!**/__mocks__/**",
    ],
    preset: "jest-expo",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native|expo|@react-navigation|@expo|@react-native|uuid|@smashchats/library)"
    ],
    coverageDirectory: "./coverage",
    testPathIgnorePatterns: ["node_modules"],
    moduleNameMapper: {
        "^@/(.*)\\.js$": "<rootDir>/$1.ts",
        "^@/(.*)\\.jsx$": "<rootDir>/$1.tsx",
    },
    setupFiles: [
        "<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js"
    ]
};
