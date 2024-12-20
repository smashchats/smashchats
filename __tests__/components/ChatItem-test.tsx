import * as React from "react";
import { render } from "@testing-library/react-native";
import ChatItem, { dateToShowableString } from "@/src/components/fragments/ChatList/ChatItem.jsx";
import { DAY, HOUR } from "@/src/utils/Utils.js";

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
