import { treaty } from "@elysiajs/eden";
import type { App } from "backend/src/index";

// Use relative URL in production, localhost in development
const apiBase = import.meta.env.DEV ? "localhost:3333" : window.location.host;

export const api = treaty<App>(apiBase);
