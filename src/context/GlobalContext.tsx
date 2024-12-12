import * as React from "react";
import { createContext, useContext, useReducer } from "react";

import {
    ChatListAction,
    ChatListParams,
    chatListReducer,
    INITIAL_CHAT_LIST_STATE,
} from "@/src/context/ChatListContext.js";
import {
    UserAction,
    userReducer,
    UserState,
} from "@/src/context/UsersContext.js";
import { SmashUser } from "smash-node-lib";

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
    settings: Settings;
}

export interface SetUserAction extends GlobalActionBase {
    type: "SET_USER_ACTION";
    user: SmashUser;
}

export interface SetAppWorkflowAction extends GlobalActionBase {
    type: "SET_APP_WORKFLOW_ACTION";
    appWorkflow:
        | "LOADING"
        | "REGISTERING"
        | "REGISTERED"
        | "CONNECTING"
        | "CONNECTED";
}

export type Action =
    | ChatListAction
    | UserAction
    | LatestMessageIdInDiscussionAction
    | SetAppWorkflowAction
    | SetSettingsAction
    | SetUserAction;

type AppWorkflow =
    | "LOADING"
    | "REGISTERING"
    | "REGISTERED"
    | "CONNECTING"
    | "CONNECTED";

export type GlobalParams = {
    chatList: ChatListParams;
    users: Record<string, UserState>;
    latestMessageIdInDiscussion: Record<string, string>;
    selfSmashUser: SmashUser;
    settings: Settings;
    appWorkflow: AppWorkflow;
};

export const INITIAL_GLOBAL_STATE: GlobalParams = {
    chatList: INITIAL_CHAT_LIST_STATE,
    users: {},
    latestMessageIdInDiscussion: {},
    selfSmashUser: null as unknown as SmashUser,
    settings: DEFAULT_SETTINGS,
    appWorkflow: "LOADING",
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
        users: userReducer(state.users, action),
        appWorkflow: appWorkflowReducer(state.appWorkflow, action),
        settings: settingsReducer(state.settings, action),
        selfSmashUser: selfSmashUserReducer(state.selfSmashUser, action),
    };
};

function appWorkflowReducer(
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

function settingsReducer(settings: Settings, action: Action): Settings {
    if (action.type !== "SET_SETTINGS_ACTION") {
        return settings;
    }
    return action.settings;
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
