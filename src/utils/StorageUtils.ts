import AsyncStorage from "@react-native-async-storage/async-storage";

export const IDENTITY_KEY = "smash.identity";
export const PROFILE_KEY = "smash.profile";

export const getData = async <T extends {}>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await getRawData(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.warn(`StorageUtils::getData: ${key} read failed: ${e}`);
        return null;
    }
};

export const getRawData = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (e) {
        console.warn(`StorageUtils::getRawData: ${key} read failed: ${e}`);
        return null;
    }
};

export const saveObject = async <T extends {}>(key: string, data: T) => {
    if (!data) return;
    try {
        await saveRawData(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`StorageUtils::saveObject: ${key} save failed: ${e}`);
    }
};

export const saveRawData = async (key: string, data: string) => {
    if (typeof data !== "string") return;
    try {
        await AsyncStorage.setItem(key, data);
    } catch (e) {
        console.warn(`StorageUtils::saveRawData: ${key} save failed: ${e}`);
    }
};
