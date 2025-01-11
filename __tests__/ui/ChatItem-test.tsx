import * as React from "react";
import { render } from "@testing-library/react-native";
import { ChatItem, dateToShowableString } from "@/src/ui/fragments/ChatList";
import { DAY, HOUR } from "@/src/utils/Utils.js";
import { getExcerpt } from "@/src/ui/fragments/ChatList/ChatItem";
import { IM_CHAT_TEXT } from "@smashchats/library";

describe(`chat item`, () => {
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

    describe("date display", () => {
        it("shows the time if the message was sent in the same day", () => {
            const date = new Date(new Date().getTime() - 1 * HOUR);
            const result = dateToShowableString(date);

            // expect to match regex for time
            expect(result).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
        });

        it('shows "Yesterday" if the message was sent before midnight yesterday', () => {
            const date = new Date(
                new Date(
                    `${new Date(
                        new Date().getTime() - 1 * DAY
                    ).toDateString()} 23:59:00`
                )
            );
            const result = dateToShowableString(date);

            expect(result).toBe("Yesterday");
        });

        it('shows "Yesterday" if the message was sent more than one day ago', () => {
            const date = new Date(new Date().getTime() - 1 * DAY);
            const result = dateToShowableString(date);

            expect(result).toBe("Yesterday");
        });

        it("shows the weekday if the message was sent less than one week ago", () => {
            const date = new Date(new Date().getTime() - 3 * DAY);
            const result = dateToShowableString(date);

            expect(result).toMatch(
                /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/
            );
        });

        it("shows the date if the message was sent more than one week ago", () => {
            const date = new Date("2024-05-01");
            const result = dateToShowableString(date);

            expect(result).toBe("05/01/2024");
        });
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
