import { new_parser } from "@/src/events/UserDisplayDataReducer";
import { EncapsulatedSmashMessage, SmashDID } from "@smashchats/library";

describe("SmashMessage converter", () => {
    test("they send you their profile", () => {
        const message: EncapsulatedSmashMessage = {
            type: "profile",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                displayName: "New username",
                imageBase64: "",
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "them-uuid" } as SmashDID,
                toDiscussionId: "me-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("metadata");
        expect(newMessage.content).toBe("They sent you their profile");
    });
    test("i send them my profile", () => {
        const message: EncapsulatedSmashMessage = {
            type: "profile",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                displayName: "New username",
                imageBase64: "",
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "me-uuid" } as SmashDID,
                toDiscussionId: "them-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("metadata");
        expect(newMessage.content).toBe("You sent them your profile");
    });

    test("I smash them", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "smash",
                target: { id: "them-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "me-uuid" } as SmashDID,
                toDiscussionId: "them-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("(You smashed them)");
    });

    test("they smash me", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "smash",
                target: { id: "me-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "them-uuid" } as SmashDID,
                toDiscussionId: "me-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("");
    });

    test("I pass on them", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "pass",
                target: { id: "them-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "me-uuid" } as SmashDID,
                toDiscussionId: "them-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("(You passed on them)");
    });

    test("they pass on me", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "pass",
                target: { id: "me-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "them-uuid" } as SmashDID,
                toDiscussionId: "me-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("");
    });

    test("I clear them", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "clear",
                target: { id: "them-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "me-uuid" } as SmashDID,
                toDiscussionId: "them-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("(You cleared them)");
    });

    test("they clear me", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "clear",
                target: { id: "me-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "them-uuid" } as SmashDID,
                toDiscussionId: "me-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("");
    });

    test("I block them", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            data: {
                action: "block",
                target: { id: "them-uuid" } as SmashDID,
            },
            after: "after",
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "me-uuid" } as SmashDID,
                toDiscussionId: "them-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("(You blocked them)");
    });

    test("they block me", () => {
        const message: EncapsulatedSmashMessage = {
            type: "action",
            timestamp: new Date().toISOString(),
            sha256: "",
            after: "after",
            data: {
                action: "block",
                target: { id: "me-uuid" } as SmashDID,
            },
        };

        const newMessage = new_parser(
            {
                ...message,
                fromDid: { id: "them-uuid" } as SmashDID,
                toDiscussionId: "me-uuid",
            },
            { id: "me-uuid" } as SmashDID
        );

        expect(newMessage.type).toBe("action");
        expect(newMessage.content).toBe("");
    });
});
