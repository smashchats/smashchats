import * as React from "react";
import { render } from "@testing-library/react-native";
import { ChatItem } from "@/src/ui/fragments/ChatList";
import { DAY } from "@/src/utils/TimeUtils.js";
import { getExcerpt } from "@/src/ui/fragments/ChatList/ChatItem";
import { IM_CHAT_TEXT } from "@smashchats/library";

jest.mock('react-native-reanimated');

describe(`chat item`, () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("unreadMessagesAmount is shown", () => {
        const tree = render(
            <ChatItem
                unread_count={73}
                most_recent_message_date={
                    new Date(new Date().getTime() - 1 * DAY).getTime()
                }
                did_id={"uid"}
                meta_title="displayName"
                most_recent_message="excerpt"
                most_recent_message_type="message_type"
                trusted_name="trusted_name"
                meta_avatar="avatar"
                smashed={false}
                active={false}
                created_at={new Date()}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });

    test("draft is shown in italics", () => {
        const tree = render(
            <ChatItem
                did_id="did_id"
                draft="draft"
                meta_title="displayName"
                most_recent_message="excerpt"
                most_recent_message_date={new Date(new Date().getTime() - 1 * DAY).getTime()}
                unread_count={0}
                most_recent_message_type="message_type"
                trusted_name="trusted_name"
                meta_avatar="avatar"
                smashed={false}
                active={false}
                created_at={new Date()}
            />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
});

describe("getExcerpt", () => {
    it("returns the first 10 words of the message", () => {
        const result = getExcerpt("This is a test message", IM_CHAT_TEXT);
        expect(result).toEqual(expect.stringContaining("This is a test"));
    });

    it("returns '(new contact)' if the message type is 'empty'", () => {
        const result = getExcerpt("This is a test message", "empty");
        expect(result).toEqual(expect.stringContaining("(new contact)"));
    });

    it("returns 'unsupported message' if the message type is not supported", () => {
        const result = getExcerpt("This is a test message", "unsupported");
        expect(result).toEqual(expect.stringContaining("unsupported message"));
    });
});
