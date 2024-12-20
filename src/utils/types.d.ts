declare module "react-native-qr" {
    export function generateQrCode(text: string, size: number): Promise<string | undefined>;
}
