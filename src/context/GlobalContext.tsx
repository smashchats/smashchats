import * as React from "react";
import { createContext, useContext, useReducer } from "react";

import {
    Logger,
    DIDDocument,
    IMProfile,
    SmashUser,
    sha256,
} from "@smashchats/library";

import {
    ChatListAction,
    ChatListParams,
    chatListReducer,
    INITIAL_CHAT_LIST_STATE,
} from "@/src/context/ChatListContext.js";
import {
    FEATURE_FLAGS_KEY,
    PROFILE_KEY,
    saveObject,
} from "@/src/utils/StorageUtils";
import { GalleryMediaItem } from "@/src/app/gallery";

// Types & Interfaces
export interface Settings {
    telemetryEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    telemetryEnabled: false,
};

export interface GlobalActionBase {
    type: `${string}_ACTION`;
}

// Action Interfaces
export interface LatestMessageIdInDiscussionAction extends GlobalActionBase {
    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION";
    discussionId: string;
    messageId: sha256;
}

export interface SetSettingsAction extends GlobalActionBase {
    type: "SET_SETTINGS_ACTION";
    settings: Settings | null;
}

export interface SetSettingsUserMetaAction extends GlobalActionBase {
    type: "SET_SETTINGS_USER_META_ACTION";
    userMeta: Partial<IMProfile> | null;
}

export interface SetLoggerAction extends GlobalActionBase {
    type: "SET_LOGGER_ACTION";
    logger: Logger;
}

export interface SetUserAction extends GlobalActionBase {
    type: "SET_USER_ACTION";
    user: SmashUser;
}

export interface SetSelfDidAction extends GlobalActionBase {
    type: "SET_SELF_DID_ACTION";
    selfDid: DIDDocument;
}

export type AppWorkflow =
    | "LOADING"
    | "REGISTERING"
    | "REGISTERED"
    | "CONNECTING"
    | "CONNECTED";

export interface SetAppWorkflowAction extends GlobalActionBase {
    type: "SET_APP_WORKFLOW_ACTION";
    appWorkflow: AppWorkflow;
}

export interface SetShownMediaInGalleryAction extends GlobalActionBase {
    type: "SET_SHOWN_MEDIA_IN_GALLERY_ACTION";
    media: GalleryMediaItem[];
}

export interface AddShownMediaInGalleryAction extends GlobalActionBase {
    type: "ADD_SHOWN_MEDIA_IN_GALLERY_ACTION";
    media: GalleryMediaItem;
}

// Media Player Types
export interface MediaPlayerState {
    currentMedia: {
        id: string;
        uri: string;
        isPlaying: boolean;
    } | null;
}

export interface PlayMediaAction extends GlobalActionBase {
    type: "PLAY_MEDIA_ACTION";
    payload: {
        id: string;
        uri: string;
    };
}

export interface StopMediaAction extends GlobalActionBase {
    type: "STOP_MEDIA_ACTION";
}

export interface PauseMediaAction extends GlobalActionBase {
    type: "PAUSE_MEDIA_ACTION";
}

export interface SetFeatureFlagsAction extends GlobalActionBase {
    type: "SET_FEATURE_FLAGS_ACTION";
    featureFlags: Record<string, boolean>;
}

// Update Action type
export type Action =
    | ChatListAction
    | LatestMessageIdInDiscussionAction
    | SetAppWorkflowAction
    | SetSettingsAction
    | SetSettingsUserMetaAction
    | SetLoggerAction
    | SetUserAction
    | SetSelfDidAction
    | SetShownMediaInGalleryAction
    | AddShownMediaInGalleryAction
    | PlayMediaAction
    | StopMediaAction
    | PauseMediaAction
    | SetFeatureFlagsAction;

// Update GlobalParams
export type GlobalParams = {
    chatList: ChatListParams;
    latestMessageIdInDiscussion: Record<string, sha256>;
    selfSmashUser: SmashUser;
    selfDid: DIDDocument;
    settings: Settings;
    userMeta: Partial<IMProfile>;
    appWorkflow: AppWorkflow;
    logger: Logger;
    shownMediaInGallery: GalleryMediaItem[];
    mediaPlayer: MediaPlayerState;
    featureFlags: Record<string, boolean>;
};

// Update INITIAL_GLOBAL_STATE
export const INITIAL_GLOBAL_STATE: GlobalParams = {
    chatList: INITIAL_CHAT_LIST_STATE,
    latestMessageIdInDiscussion: {},
    selfSmashUser: null as unknown as SmashUser,
    selfDid: null as unknown as DIDDocument,
    settings: DEFAULT_SETTINGS,
    userMeta: {
        title: "",
        description: "",
        avatar: "",
    } as IMProfile,
    appWorkflow: "LOADING",
    logger: new Logger("device", "WARN"),
    shownMediaInGallery: [],
    mediaPlayer: {
        currentMedia: null,
    },
    featureFlags: {},
};

// Context Types
type GlobalContextType = [
    state: GlobalParams,
    dispatch: React.Dispatch<Action>
];

// Context Creation
const GlobalContext = React.createContext<GlobalContextType>([
    INITIAL_GLOBAL_STATE,
    {} as React.Dispatch<Action>,
]);

const GlobalStateContext = createContext<GlobalParams>(INITIAL_GLOBAL_STATE);
const GlobalDispatchContext = createContext<React.Dispatch<Action>>(
    {} as React.Dispatch<Action>
);

// Root Reducer
export const rootReducer = (
    state: GlobalParams,
    action: Action
): GlobalParams => {
    console.info("dispatched", action.type);

    return {
        ...state,
        chatList: chatListReducer(state.chatList, action),
        latestMessageIdInDiscussion: latestMessageIdInDiscussionReducer(
            state.latestMessageIdInDiscussion,
            action
        ),
        appWorkflow: appWorkflowReducer(state.appWorkflow, action),
        settings: settingsReducer(state.settings, action),
        userMeta: userMetaReducer(state.userMeta, action),
        selfSmashUser: selfSmashUserReducer(state.selfSmashUser, action),
        selfDid: selfDidReducer(state.selfDid, action),
        logger: loggerReducer(state.logger, action),
        shownMediaInGallery: shownMediaInGalleryReducer(
            state.shownMediaInGallery,
            action
        ),
        mediaPlayer: mediaPlayerReducer(state.mediaPlayer, action),
        featureFlags: featureFlagsReducer(state.featureFlags, action),
    };
};

// Individual Reducers
export function appWorkflowReducer(
    appWorkflow: AppWorkflow,
    action: SetAppWorkflowAction | Action
): AppWorkflow {
    if (action.type !== "SET_APP_WORKFLOW_ACTION") {
        return appWorkflow;
    }

    const validTransitions: Record<AppWorkflow, AppWorkflow[]> = {
        LOADING: ["CONNECTING", "REGISTERING"],
        REGISTERING: ["REGISTERED"],
        CONNECTING: ["CONNECTED"],
        REGISTERED: ["CONNECTED"],
        CONNECTED: ["CONNECTING"],
    };

    const allowedTransitions = validTransitions[appWorkflow];
    return allowedTransitions?.includes(action.appWorkflow)
        ? action.appWorkflow
        : appWorkflow;
}

// Context Provider Component
export const GlobalProvider: React.FC<{
    children: React.ReactNode;
    initialState?: Partial<GlobalParams>;
}> = ({ children, initialState }) => {
    const [state, dispatch] = useReducer(rootReducer, {
        ...INITIAL_GLOBAL_STATE,
        ...initialState,
    });

    // Persist settings and user meta changes
    React.useEffect(() => {
        if (state.settings) {
            saveObject("settings.settings", state.settings);
        }
    }, [state.settings]);

    React.useEffect(() => {
        if (state.userMeta) {
            saveObject(PROFILE_KEY, state.userMeta);
        }
    }, [state.userMeta]);

    React.useEffect(() => {
        if (state.featureFlags) {
            saveObject(FEATURE_FLAGS_KEY, state.featureFlags);
        }
    }, [state.featureFlags]);

    return (
        <GlobalStateContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>
                {children}
            </GlobalDispatchContext.Provider>
        </GlobalStateContext.Provider>
    );
};

// Custom Hooks
export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error("useGlobalState must be used within a GlobalProvider");
    }
    return context;
}

export function useGlobalDispatch() {
    const context = useContext(GlobalDispatchContext);
    if (context === undefined) {
        throw new Error(
            "useGlobalDispatch must be used within a GlobalProvider"
        );
    }
    return context;
}

export const GlobalConsumer = GlobalContext.Consumer;

export default GlobalContext;

// Reducer Functions
function latestMessageIdInDiscussionReducer(
    latestMessageIdInDiscussion: Record<string, sha256>,
    action: LatestMessageIdInDiscussionAction | Action
): Record<string, sha256> {
    if (action.type !== "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION") {
        return latestMessageIdInDiscussion;
    }
    return {
        ...latestMessageIdInDiscussion,
        [action.discussionId]: action.messageId,
    };
}

export function settingsReducer(settings: Settings, action: Action): Settings {
    if (action.type !== "SET_SETTINGS_ACTION") {
        return settings;
    }
    return action.settings ?? DEFAULT_SETTINGS;
}

export function userMetaReducer(
    userMeta: Partial<IMProfile>,
    action: Action
): Partial<IMProfile> {
    if (action.type !== "SET_SETTINGS_USER_META_ACTION") {
        return userMeta;
    }
    return (
        action.userMeta ??
        ({ title: "", description: "", avatar: "" } as Partial<IMProfile>)
    );
}

function selfSmashUserReducer(
    selfSmashUser: SmashUser,
    action: Action
): SmashUser {
    if (action.type !== "SET_USER_ACTION") {
        return selfSmashUser;
    }
    return action.user;
}

export function selfDidReducer(
    selfDid: DIDDocument,
    action: Action
): DIDDocument {
    if (action.type !== "SET_SELF_DID_ACTION") {
        return selfDid;
    }
    return action.selfDid ?? selfDid;
}

function loggerReducer(logger: Logger, action: Action): Logger {
    if (action.type !== "SET_LOGGER_ACTION") {
        return logger;
    }
    return action.logger;
}

function shownMediaInGalleryReducer(
    shownMediaInGallery: GalleryMediaItem[],
    action: Action
): GalleryMediaItem[] {
    switch (action.type) {
        case "SET_SHOWN_MEDIA_IN_GALLERY_ACTION":
            return [...action.media];
        case "ADD_SHOWN_MEDIA_IN_GALLERY_ACTION":
            return [...shownMediaInGallery, action.media];
        default:
            return shownMediaInGallery;
    }
}

// Media Player Reducer
export function mediaPlayerReducer(
    state: MediaPlayerState,
    action: Action
): MediaPlayerState {
    switch (action.type) {
        case "PLAY_MEDIA_ACTION":
            return {
                currentMedia: {
                    ...action.payload,
                    isPlaying: true,
                },
            };

        case "STOP_MEDIA_ACTION":
            return {
                currentMedia: null,
            };

        case "PAUSE_MEDIA_ACTION":
            if (state.currentMedia) {
                return {
                    currentMedia: {
                        ...state.currentMedia,
                        isPlaying: false,
                    },
                };
            }
            return state;

        default:
            return state;
    }
}

export function featureFlagsReducer(
    featureFlags: Record<string, boolean>,
    action: Action
): Record<string, boolean> {
    if (action.type !== "SET_FEATURE_FLAGS_ACTION") {
        return featureFlags;
    }
    return {
        ...featureFlags,
        ...action.featureFlags,
    };
}
