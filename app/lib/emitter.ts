import { EventEmitter } from "events";

const globalForEmitter = globalThis as unknown as { emitter: EventEmitter };

export const emitter = globalForEmitter.emitter ?? new EventEmitter();
emitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") globalForEmitter.emitter = emitter;
