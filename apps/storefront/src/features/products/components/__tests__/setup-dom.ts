import { Window } from "happy-dom";

const window = new Window();
console.log("Setting up DOM globals...");
(globalThis as any).window = window;
(globalThis as any).document = window.document;
(globalThis as any).navigator = window.navigator;
(globalThis as any).customElements = window.customElements;
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = window.navigator;
(global as any).customElements = window.customElements;
console.log("document exists:", !!globalThis.document, "body exists:", !!globalThis.document?.body);
