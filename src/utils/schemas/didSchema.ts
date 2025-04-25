import { z } from "zod";

import { parseJsonPreprocessor } from "./jsonSchema";

export const SmashEndpointShapeSchema = z.object({
    url: z.string(),
    preKey: z.string(),
    signature: z.string(),
});

export const SmashEndpointSchema = z.preprocess(
    parseJsonPreprocessor,
    SmashEndpointShapeSchema
);

export const DidStringSchema = z.string({ coerce: true }).refine((val) => {
    if (typeof val !== "string") {
        return false;
    }
    if (!val.startsWith("did:")) {
        return false;
    }
    const parts = val.split(":");
    if (parts.length !== 3) {
        return false;
    }
    if (!["key", "web", "plc", "doc"].includes(parts[1])) {
        return false;
    }
    if (parts[2].length === 0) {
        return false;
    }
    return true;
});

export const DIDDocumentShapeSchema = z.object({
    id: DidStringSchema,
    ik: z.string(),
    ek: z.string(),
    signature: z.string(),
    endpoints: z.array(SmashEndpointSchema),
});

export const DIDDocumentSchema = z.preprocess(
    parseJsonPreprocessor,
    DIDDocumentShapeSchema
);

export type DIDDocument = z.infer<typeof DIDDocumentSchema>;
