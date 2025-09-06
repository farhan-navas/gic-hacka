/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/bus.ts
import { EventEmitter } from "events";

type Event =
  | { type: "telemetry"; data: any }
  | { type: "agent_log"; data: string }
  | {
      type: "agent_action";
      data: { name: string; args: any; result?: any; error?: string };
    }
  | { type: "agent_done"; data: { summary: string } };

class Bus extends EventEmitter {
  emitEvent(e: Event) {
    this.emit("event", e);
  }
  onEvent(cb: (e: Event) => void) {
    this.on("event", cb);
  }
  offEvent(cb: (e: Event) => void) {
    this.off("event", cb);
  }
}

export const bus = new Bus();
