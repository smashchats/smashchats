import * as React from "react";
import { createContext, useContext, useReducer } from "react";

import {
    ChatListAction,
    ChatListParams,
    chatListReducer,
    INITIAL_CHAT_LIST_STATE,
} from "@/src/context/ChatListContext.js";
import { Logger, DIDDocument, IMProfile, SmashUser } from "@smashchats/library";
import { saveData } from "@/src/utils/StorageUtils";

export interface Settings {
    telemetryEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    telemetryEnabled: false, // opt-in, so default is false
};

export interface GlobalActionBase {
    type: `${string}_ACTION`;
}

export interface LatestMessageIdInDiscussionAction extends GlobalActionBase {
    type: "LATEST_MESSAGE_ID_IN_DISCUSSION_ACTION";
    discussionId: string;
    messageId: string;
}

export interface SetSettingsAction extends GlobalActionBase {
    type: "SET_SETTINGS_ACTION";
    settings: Settings | null;
}

export interface SetSettingsUserMetaAction extends GlobalActionBase {
    type: "SET_SETTINGS_USER_META_ACTION";
    userMeta: IMProfile | null;
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

export type Action =
    | ChatListAction
    | LatestMessageIdInDiscussionAction
    | SetAppWorkflowAction
    | SetSettingsAction
    | SetSettingsUserMetaAction
    | SetLoggerAction
    | SetUserAction
    | SetSelfDidAction;

export type GlobalParams = {
    chatList: ChatListParams;
    latestMessageIdInDiscussion: Record<string, string>;
    selfSmashUser: SmashUser;
    selfDid: DIDDocument;
    settings: Settings;
    userMeta: IMProfile;
    appWorkflow: AppWorkflow;
    logger: Logger;
};

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
};

type GlobalContextType = [
    state: GlobalParams,
    dispatch: React.Dispatch<Action>
];

const GlobalContext = React.createContext<GlobalContextType>([
    INITIAL_GLOBAL_STATE,
    {} as React.Dispatch<Action>,
]);

const GlobalStateContext = createContext<GlobalParams>(INITIAL_GLOBAL_STATE);
const GlobalDispatchContext = createContext<React.Dispatch<Action>>(
    {} as React.Dispatch<Action>
);

export const rootReducer = (
    state: GlobalParams,
    action: Action
): GlobalParams => {
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
    };
};

export function appWorkflowReducer(
    appWorkflow: AppWorkflow,
    action: SetAppWorkflowAction | Action
): AppWorkflow {
    if (action.type !== "SET_APP_WORKFLOW_ACTION") {
        return appWorkflow;
    }

    // Validate state transitions
    switch (appWorkflow) {
        case "LOADING":
            // From LOADING, can only go to CONNECTING or REGISTERING
            if (
                action.appWorkflow === "CONNECTING" ||
                action.appWorkflow === "REGISTERING"
            ) {
                return action.appWorkflow;
            }
            break;

        case "REGISTERING":
            // From REGISTERING, can only go to REGISTERED
            if (action.appWorkflow === "REGISTERED") {
                return action.appWorkflow;
            }
            break;

        case "CONNECTING":
        // From CONNECTING, can only go to CONNECTED
        case "REGISTERED":
            // From REGISTERED, can only go to CONNECTED
            if (action.appWorkflow === "CONNECTED") {
                return action.appWorkflow;
            }
            break;

        case "CONNECTED":
            // From CONNECTED, can only go back to CONNECTING
            if (action.appWorkflow === "CONNECTING") {
                return action.appWorkflow;
            }
            break;
    }
    // If transition is not allowed, return current state
    return appWorkflow;
}

export const GlobalProvider: React.FC<{
    children: React.ReactNode;
    initialState?: Partial<GlobalParams>;
}> = ({ children, initialState }) => {
    const [state, dispatch] = useReducer(rootReducer, {
        ...INITIAL_GLOBAL_STATE,
        ...initialState,
    });

    React.useEffect(() => {
        if (state.settings) {
            saveData("settings.settings", state.settings);
        }
    }, [state.settings]);

    React.useEffect(() => {
        if (state.userMeta) {
            saveData("settings.user_meta", state.userMeta);
        }
    }, [state.userMeta]);

    return (
        <GlobalStateContext.Provider value={state}>
            <GlobalDispatchContext.Provider value={dispatch}>
                {children}
            </GlobalDispatchContext.Provider>
        </GlobalStateContext.Provider>
    );
};

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

function latestMessageIdInDiscussionReducer(
    latestMessageIdInDiscussion: Record<string, string>,
    action: LatestMessageIdInDiscussionAction | Action
): Record<string, string> {
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
    userMeta: IMProfile,
    action: Action
): IMProfile {
    if (action.type !== "SET_SETTINGS_USER_META_ACTION") {
        return userMeta;
    }
    return (
        action.userMeta ??
        ({ title: "", description: "", avatar: "" } as IMProfile)
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
    if (!action.selfDid) {
        return selfDid;
    }
    return action.selfDid;
}
function loggerReducer(logger: Logger, action: Action): Logger {
    if (action.type !== "SET_LOGGER_ACTION") {
        return logger;
    }
    return action.logger;
}
