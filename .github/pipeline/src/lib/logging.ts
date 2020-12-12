import { Core } from "./github/types";

export function nope(message: string, core: Core): void {
  console.error("Error:", message);
  core.error(message);
}

export function warn(message: string, core: Core): void {
  console.warn("Warning:", message);
  core.warning(message);
}
