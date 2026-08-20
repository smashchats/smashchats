import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import ImageResizer from "@bam.tech/react-native-image-resizer";

export const convertImageToBase64 = async (fileUri: string) => {
    try {
        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return base64Data;
    } catch (error) {
        console.error("Error converting image to base64:", error);

        return null;
    }
};

export const DEFAULT_RESIZE_OPTIONS = {
    onlyScaleDown: true,
    quality: 100,
    width: 150,
    height: 150,
    format: "JPEG" as const,
};

export const resizeImage = async (
    path: string,
    options: Partial<typeof DEFAULT_RESIZE_OPTIONS> = DEFAULT_RESIZE_OPTIONS
) => {
    const { onlyScaleDown, quality, width, height, format } = {
        ...DEFAULT_RESIZE_OPTIONS,
        ...options,
    };
    return ImageResizer.createResizedImage(
        path,
        width,
        height,
        format,
        quality,
        0,
        null,
        false,
        {
            onlyScaleDown,
        }
    );
};

export const PickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // to allow user cropping it into a square
        aspect: [1, 1],
        quality: 0.5,
    });

    if (!result.canceled) {
        const uri = result.assets[0].uri;
        const resizedImage = await resizeImage(uri, {
            quality: 50,
            width: 150,
            height: 150,
        });
        return await convertImageToBase64(resizedImage.uri);
    }
    return null;
}
