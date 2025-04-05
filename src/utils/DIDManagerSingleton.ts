import { DIDDocManager } from "@smashchats/library";

class DIDManagerSingleton {
    private static instance: DIDManagerSingleton;
    private readonly didManager: DIDDocManager;

    private constructor() {
        this.didManager = new DIDDocManager();
    }

    public static getInstance(): DIDManagerSingleton {
        if (!DIDManagerSingleton.instance) {
            DIDManagerSingleton.instance = new DIDManagerSingleton();
        }
        return DIDManagerSingleton.instance;
    }

    public getDIDManager(): DIDDocManager {
        return this.didManager;
    }
}

export const getDIDManager = (): DIDDocManager => {
    return DIDManagerSingleton.getInstance().getDIDManager();
}; 