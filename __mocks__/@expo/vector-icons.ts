import { Text } from 'react-native';
import React from 'react';

export const MaterialCommunityIcons = ({ name, size, color }: any) => 
    React.createElement(Text, {}, name);

MaterialCommunityIcons.loadFont = () => Promise.resolve("");

export const Ionicons = ({ name, size, color }: any) => 
    React.createElement(Text, {}, name);

Ionicons.loadFont = () => Promise.resolve("");

// Add other icon sets as needed 