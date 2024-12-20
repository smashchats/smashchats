import AsyncStorage from "@react-native-async-storage/async-storage";

export const getData = async <T extends {}>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.warn(`StorageUtils::getData: ${key} read failed: ${e}`);
        return null;
    }
};

export const saveData = async <T extends {}>(key: string, data: T) => {
    if (!data) return
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`StorageUtils::saveData: ${key} save failed: ${e}`);
    }
};
