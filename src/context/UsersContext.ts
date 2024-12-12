import { Message } from "@/src/app/profile/[user]/(tabs)/messages.js";
import {
    Action,
    GlobalActionBase,
    GlobalParams,
} from "@/src/context/GlobalContext.js";
import { EncapsulatedSmashMessage, SmashDID } from "smash-node-lib";
import { SmashMessageToMessage } from "@/src/context/ChatListContext.js";

interface UserReadDiscussionAction extends GlobalActionBase {
    type: `USER_READ_DISCUSSION_ACTION`;
    discussionId: string;
}

interface UserOpenDiscussionAction extends GlobalActionBase {
    type: `USER_OPEN_DISCUSSION_ACTION`;
    discussionId: string;
}

interface UserReceiveMessageAction extends GlobalActionBase {
    type: `USER_RECEIVE_MESSAGE_ACTION`;
    message: EncapsulatedSmashMessage;
    from: SmashDID;
}

interface UserSendMessageAction extends GlobalActionBase {
    type: `USER_SEND_MESSAGE_ACTION`;
    from: SmashDID;
    discussionId: string;
    message: Message;
}

export type UserAction =
    | UserReadDiscussionAction
    | UserOpenDiscussionAction
    | UserReceiveMessageAction
    | UserSendMessageAction;

export type UserState = {
    peerDid: SmashDID;
    recentMessages: Message[];
    lastReadMessageId: string;
};

export const INITIAL_PEER_STATE: UserState = {
    peerDid: {
        id: "",
        ik: "",
        ek: "",
        signature: "",
        endpoints: [],
    },
    recentMessages: [],
    lastReadMessageId: "",
};

export const userReducer = (
    state: GlobalParams["users"],
    action: UserAction | Action
): GlobalParams["users"] => {
    const getUserOrCreateIfItDoesNotExist = (
        state: GlobalParams["users"],
        uid: string
    ): GlobalParams["users"] => {
        if (state[uid] === undefined) {
            return {
                ...state,
                [uid]: {
                    ...INITIAL_PEER_STATE,
                },
            };
        }
        return state;
    };
    // let out = { ...state };

    switch (action.type) {
        case "USER_READ_DISCUSSION_ACTION":
            return state;

        case "USER_OPEN_DISCUSSION_ACTION":
            return getUserOrCreateIfItDoesNotExist(state, action.discussionId);

        case "USER_RECEIVE_MESSAGE_ACTION":
            const out = getUserOrCreateIfItDoesNotExist(state, action.from.id);

            out[action.from.id].recentMessages = [
                ...out[action.from.id].recentMessages,
                SmashMessageToMessage(action.message, action.from),
            ];
            return out;

        case "USER_SEND_MESSAGE_ACTION": {
            const out = getUserOrCreateIfItDoesNotExist(
                state,
                action.discussionId
            );

            out[action.discussionId].recentMessages = [
                ...out[action.discussionId].recentMessages,
                action.message,
            ];

            return out;
        }

        default:
            return state;
    }
};
