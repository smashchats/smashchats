import { View, Text, Image, ScrollView } from 'react-native';

export default {
  useSharedValue: (initialValue: any) => ({ value: initialValue }),
  useAnimatedStyle: () => ({}),
  withTiming: (toValue: any) => toValue,
  interpolate: () => 0,
  
  View,
  Text,
  Image,
  ScrollView,
  createAnimatedComponent: (Component: any) => Component,
};

export const useSharedValue = (initialValue: any) => ({ value: initialValue });
export const useAnimatedStyle = () => ({});
export const withTiming = (toValue: any) => toValue;
export const interpolate = () => 0;
export const Easing = {
  linear: () => {},
  ease: () => {},
  bezier: () => () => {},
  in: () => {},
  out: () => {},
  inOut: () => {},
};
export const Extrapolation = {
  CLAMP: 'clamp',
};
export const cancelAnimation = () => {}; 