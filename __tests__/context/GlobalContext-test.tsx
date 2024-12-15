import { renderHook } from "@testing-library/react-native";
import GlobalContext, {
    AppWorkflow,
    GlobalProvider,
    Settings,
    appWorkflowReducer,
    settingsReducer,
    useGlobalDispatch,
    userMetaReducer,
} from "@/src/context/GlobalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "react-native";
import { useEffect } from "react";
import { SmashProfileMeta } from "@smashchats/library";

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
        const initialState = {} as SmashProfileMeta;

        it("should set default user meta if no user meta is provided", () => {
            const newState = userMetaReducer(initialState, {
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: null,
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    title: "",
                    description: "",
                    picture: "",
                })
            );
        });

        it("should save user meta if user meta is provided", () => {
            const newState = userMetaReducer(initialState, {
                type: "SET_SETTINGS_USER_META_ACTION",
                userMeta: {
                    title: "test",
                    description: "test",
                    picture: "test",
                },
            });
            expect(newState).toEqual(
                expect.objectContaining({
                    title: "test",
                    description: "test",
                    picture: "test",
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
                            picture: "test",
                        },
                    });

                useEffect(updateUserMetaToTestValues, [dispatch]);
                return <View></View>;
            },
            {
                wrapper: GlobalProvider,
            }
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            "settings.user_meta",
            JSON.stringify({
                title: "test",
                description: "test",
                picture: "test",
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
