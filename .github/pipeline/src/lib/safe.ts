import { Core } from "./github/types";
import { nope } from "./logging";

export function safe<T>(fn: () => T, message: string, core: Core): T | undefined {
  try {
    return fn();
  } catch (error) {
    const errorMessage = (error as { message: string })?.message ?? (error as string);

    nope(`${message}: ${errorMessage}`, core);
  }
}
