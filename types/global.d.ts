// React 19 removed the global `JSX` namespace — it now lives under `React.JSX`.
// This codebase annotates many components with `JSX.Element`, so rather than
// rewrite every signature, re-expose the namespace globally as an alias.
//
// This is a compatibility shim, not the end state: new code should annotate
// with `React.JSX.Element` directly, and this file can go once the existing
// usages are migrated.
import type * as React from "react";

declare global {
    namespace JSX {
        type Element = React.JSX.Element;
        type ElementClass = React.JSX.ElementClass;
        type IntrinsicElements = React.JSX.IntrinsicElements;
    }
}
