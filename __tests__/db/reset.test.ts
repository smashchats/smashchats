import { resetIdentity } from "@/src/db/reset";

// jest.mock("@/src/db/schema", () => ({
//         transaction: jest.fn(),
//         exec: jest.fn(),
//         close: jest.fn(),
//     }),
// }));

jest.mock("@/src/db/schema", () => ({
    table1: "table1",
    table2: "table2",
    table3: "table3",
}));

describe("database reset", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deletes all tables", () => {
        const run: jest.Mock = jest.fn();
        resetIdentity({ run } as any);
        expect(run.mock.calls[0][0].queryChunks[0].value[0]).toEqual(
            "DROP TABLE IF EXISTS "
        );
        expect(run.mock.calls[0][0].queryChunks[1].value).toEqual("table1");

        expect(run.mock.calls[1][0].queryChunks[0].value[0]).toEqual(
            "DROP TABLE IF EXISTS "
        );
        expect(run.mock.calls[1][0].queryChunks[1].value).toEqual("table2");

        expect(run.mock.calls[2][0].queryChunks[0].value[0]).toEqual(
            "DROP TABLE IF EXISTS "
        );
        expect(run.mock.calls[2][0].queryChunks[1].value).toEqual("table3");
    });
});
