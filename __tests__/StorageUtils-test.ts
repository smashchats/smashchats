import AsyncStorage from "@react-native-async-storage/async-storage";

import { saveData, getData } from '@/src/StorageUtils'

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}));

beforeEach(() => {
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    (AsyncStorage.clear as jest.Mock).mockClear();
});

describe('getData', () => {
    it('should return parsed object', async () => {
        const data = `{"hello":"world"}`
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(data);
        const result = await getData('test');
        expect(result).toEqual({ hello: "world" });
    });

    it('should return text', async () => {
        const data = `"hello"`
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(data);
        const result = await getData('test');
        expect(result).toEqual("hello");
    })

    it('should return null if key not found', async () => {
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(null);
        const result = await getData('test');
        expect(result).toBeNull();
    });

    it('should return null if data is corrupted', async () => {
        // @ts-expect-error
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue({});
        const result = await getData('corrupted');
        expect(result).toBeNull();
    })
    it('should return null if data is undefined', async () => {
        // @ts-expect-error
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(undefined);
        const result = await getData('undefined');
        expect(result).toBeNull();
    })
});

describe('saveData', () => {
    it('should save data', async () => {
        const data = { hello: "world" }
        await saveData('test', data);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(data));
    });

    it('should not throw error if save fails', async () => {
        const data = { hello: "world" }
        // @ts-expect-error
        jest.spyOn(AsyncStorage, 'setItem').mockResolvedValue(new Error('Save failed'));
        await saveData('test', data);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(data));
    });

    it('should not save item if it\'s not serializable', async () => {
        const data = undefined
        // @ts-expect-error
        await saveData('test', data);
        expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
});
