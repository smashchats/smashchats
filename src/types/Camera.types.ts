import { SkPath } from "@shopify/react-native-skia";

export interface MediaPath {
    type: "photo" | "video";
    path: string;
}

export interface DrawingPath {
    path: SkPath;
    color: string;
    id: string;
}
