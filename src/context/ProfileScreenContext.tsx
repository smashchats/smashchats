import React, { ReactNode } from "react";

//
// ACTIONS
//
interface ScrollToEndAction {
    type: "SCROLL_TO_END";
}

interface HasScrolledToEndAction {
    type: "HAS_SCROLLED_TO_END";
}

export type Action = ScrollToEndAction | HasScrolledToEndAction;

//
// CONTEXT
//
export type ProfileScreenParams = {
    hasScrolledToEnd: boolean;
};

const initialState: ProfileScreenParams = {
    hasScrolledToEnd: false,
};

type ProfileScreenContextType = [
    state: ProfileScreenParams,
    dispatch: React.Dispatch<Action>
];

const ProfileScreenContext = React.createContext<ProfileScreenContextType>([
    initialState,
    {} as React.Dispatch<Action>,
]);

export const reducer = (
    state: ProfileScreenParams,
    action: Action
): ProfileScreenParams => {
    switch (action.type) {
        case "SCROLL_TO_END": {
            return {
                ...state,
                hasScrolledToEnd: false,
            };
        }

        case "HAS_SCROLLED_TO_END": {
            return {
                ...state,
                hasScrolledToEnd: true,
            };
        }

        default:
            return state;
    }
};

export const ProfileScreenProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducer, {
        ...initialState,
    });

    return (
        <ProfileScreenContext.Provider value={[state, dispatch]}>
            {children}
        </ProfileScreenContext.Provider>
    );
};

export const ProfileScreenConsumer = ProfileScreenContext.Consumer;

export default ProfileScreenContext;
