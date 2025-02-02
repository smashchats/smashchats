import { Buffer } from "buffer";
// @ts-ignore
process.on = () => {};
global.Buffer = Buffer;

const IGNORE_ERRORS = [
    "synthetic event",
    ": Timeout exceeded",
    "DID endpoint propagation is not implemented",
];

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
    if (
        typeof args[0] === "string" &&
        IGNORE_ERRORS.some((text) => args[0].includes(text))
    ) {
        return;
    }
    originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
    if (
        typeof args[0] === "string" &&
        IGNORE_ERRORS.some((text) => args[0].includes(text))
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};
