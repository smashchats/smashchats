import { renderHook } from "@testing-library/react-native";
import GlobalContext, {
    AppWorkflow,
    GlobalProvider,
    Settings,
    appWorkflowReducer,
    selfDidReducer,
    settingsReducer,
    useGlobalDispatch,
    userMetaReducer,
    mediaPlayerReducer,
} from "@/src/context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { useEffect } from "react";
import { DIDDocument, IMProfile } from "@smashchats/library";

afterEach(() => {
    jest.clearAllMocks();
});

it("should provide default values", () => {
    const { result } = renderHook(() => GlobalContext, {
        wrapper: GlobalProvider,
    });

    expect(result.current.Consumer).toBeTruthy();
    expect(result.current.Provider).toBeTruthy();
});

describe("settings context", () => {
    describe("settings reducer", () => {
        const initialState = {} as Settings;

        it("should set default settings if no settings are provided", () => {
            const newState = settingsReducer(initialState, {
                type: "SET_SETTINGS_ACTION",
                settings: null,
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    telemetryEnabled: false,
                })
            );
        });

        it("should set settings if settings are provided", () => {
            const newState = settingsReducer(initialState, {
                type: "SET_SETTINGS_ACTION",
                settings: {
                    telemetryEnabled: true,
                },
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    telemetryEnabled: true,
                })
            );
        });
    });

    it("should save settings to async storage", () => {
        renderHook(
            () => {
                const dispatch = useGlobalDispatch();
                useEffect(() => {
                    dispatch({
                        type: "SET_SETTINGS_ACTION",
                        settings: {
                            telemetryEnabled: true,
                        },
                    });
                }, [dispatch]);
                return <View></View>;
            },
            {
                wrapper: GlobalProvider,
            }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "settings.settings",
            JSON.stringify({
                telemetryEnabled: true,
            })
        );
    });
});

describe("user meta context", () => {
    describe("user meta reducer", () => {
        const initialState = {} as IMProfile;

        it("should set default user meta if no user meta is provided", () => {
            const newState = userMetaReducer(initialState, {
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: null,
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    title: "",
                    description: "",
                    avatar: "",
                })
            );
        });

        it("should save user meta if user meta is provided", () => {
            const newState = userMetaReducer(initialState, {
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: {
                    title: "test",
                    description: "test",
                    avatar: "test",
                } as IMProfile,
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    title: "test",
                    description: "test",
                    avatar: "test",
                })
            );
        });
    });

    it("should save user meta to async storage", () => {
        renderHook(
            () => {
                const dispatch = useGlobalDispatch();
                const updateUserMetaToTestValues = () =>
                    dispatch({
                        type: "SET_SETTINGS_USER_META_ACTION",
                        userMeta: {
                            title: "test",
                            description: "test",
                            avatar: "test",
                        } as IMProfile,
                    });

                useEffect(updateUserMetaToTestValues, [dispatch]);
                return <View></View>;
            },
            {
                wrapper: GlobalProvider,
            }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "smash.profile",
            JSON.stringify({
                title: "test",
                description: "test",
                avatar: "test",
            })
        );
    });
});

describe("app workflow reducer", () => {
    [
        ["LOADING", "REGISTERING"],
        ["REGISTERING", "REGISTERED"],
        ["REGISTERED", "CONNECTED"],
        ["LOADING", "CONNECTING"],
        ["CONNECTING", "CONNECTED"],
        ["CONNECTED", "CONNECTING"],
    ].forEach(([currentState, newState]) => {
        it(`should set app workflow to ${newState} if app workflow is ${currentState}`, () => {
            const result = appWorkflowReducer(currentState as AppWorkflow, {
                type: "SET_APP_WORKFLOW_ACTION",
                appWorkflow: newState as AppWorkflow,
            });
            expect(result).toEqual(newState);
        });
    });

    it("should NOT set app workflow if app workflow is not valid", () => {
        const result = appWorkflowReducer("LOADING", {
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "INVALID" as AppWorkflow,
        });
        expect(result).toEqual("LOADING");
    });

    [
        ["REGISTERED", "REGISTERING"],
        ["CONNECTED", "LOADING"],
    ].forEach(([currentState, newState]) => {
        it(`should NOT set app workflow to ${newState} if app workflow is ${currentState}`, () => {
            const result = appWorkflowReducer(currentState as AppWorkflow, {
                type: "SET_APP_WORKFLOW_ACTION",
                appWorkflow: newState as AppWorkflow,
            });
            expect(result).toEqual(currentState);
        });
    });
});

describe("self did string reducer", () => {
    const example_DID = {
        id: "did:key:test",
        ik: "ik",
        ek: "ek",
        signature: "signature",
        endpoints: [],
    } as DIDDocument;
    it("should set self did string to the provided did string", () => {
        const result = selfDidReducer(null as unknown as DIDDocument, {
            type: "SET_SELF_DID_ACTION",
            selfDid: example_DID,
        });
        expect(result).toEqual(example_DID);
    });

    it("should not set self did string if the action is not a SET_SELF_DID_ACTION", () => {
        const result = selfDidReducer(example_DID, {
            type: "SET_APP_WORKFLOW_ACTION",
            appWorkflow: "LOADING",
        });
        expect(result).toEqual(example_DID);
    });

    it("should not set self did string to empty string", () => {
        const result = selfDidReducer(example_DID, {
            type: "SET_SELF_DID_ACTION",
            selfDid: null as unknown as DIDDocument,
        });
        expect(result).toEqual(example_DID);
    });
});

describe("media player reducer", () => {
    const initialState = {
        currentMedia: null,
    };

    it("should play media when PLAY_MEDIA_ACTION is dispatched", () => {
        const result = mediaPlayerReducer(initialState, {
            type: "PLAY_MEDIA_ACTION",
            payload: {
                id: "test-id",
                uri: "test-uri",
            },
        });
        expect(result).toEqual({
            currentMedia: {
                id: "test-id",
                uri: "test-uri",
                isPlaying: true,
            },
        });
    });

    it("should stop media when STOP_MEDIA_ACTION is dispatched", () => {
        const stateWithPlayingMedia = {
            currentMedia: {
                id: "test-id",
                uri: "test-uri",
                isPlaying: true,
            },
        };
        const result = mediaPlayerReducer(stateWithPlayingMedia, {
            type: "STOP_MEDIA_ACTION",
        });
        expect(result).toEqual({
            currentMedia: null,
        });
    });

    it("should pause media when PAUSE_MEDIA_ACTION is dispatched", () => {
        const stateWithPlayingMedia = {
            currentMedia: {
                id: "test-id",
                uri: "test-uri",
                isPlaying: true,
            },
        };
        const result = mediaPlayerReducer(stateWithPlayingMedia, {
            type: "PAUSE_MEDIA_ACTION",
        });
        expect(result).toEqual({
            currentMedia: {
                id: "test-id",
                uri: "test-uri",
                isPlaying: false,
            },
        });
    });

    it("should not change state when PAUSE_MEDIA_ACTION is dispatched with no current media", () => {
        const result = mediaPlayerReducer(initialState, {
            type: "PAUSE_MEDIA_ACTION",
        });
        expect(result).toEqual(initialState);
    });

    it("should not change state when an unknown action is dispatched", () => {
        const stateWithPlayingMedia = {
            currentMedia: {
                id: "test-id",
                uri: "test-uri",
                isPlaying: true,
            },
        };
        const result = mediaPlayerReducer(stateWithPlayingMedia, {
            type: "UNKNOWN_ACTION",
        } as any);
        expect(result).toEqual(stateWithPlayingMedia);
    });
});
