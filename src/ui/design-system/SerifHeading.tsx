import React, { type PropsWithChildren } from "react";
import { TextStyle } from "react-native";

import { Heading } from "@/src/ui/design-system/Heading";

type Props = PropsWithChildren<TextStyle>;

export function SerifHeading({ children, ...rest }: Props): JSX.Element {
    return (
        <Heading
            fontSize={20}
            style={{
                fontFamily: "Didot",
                fontSize: 20,
                marginVertical: 4,
                ...rest,
            }}
        >
            {children}
        </Heading>
    );
}
