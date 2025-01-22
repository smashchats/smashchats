import { Buffer } from "buffer";
// @ts-ignore
process.on = () => {};
global.Buffer = Buffer;

const IGNORE_ERRORS = ["synthetic event", ": Timeout exceeded"];

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && IGNORE_ERRORS.some(text => args[0].includes(text))) {
        return;
    }
    originalConsoleError.apply(console, args);
};
