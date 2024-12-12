import { Buffer } from "buffer";
// @ts-ignore
process.on = () => {};
global.Buffer = Buffer;

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("synthetic event")) {
        return;
    }
    originalConsoleError.apply(console, args);
};
