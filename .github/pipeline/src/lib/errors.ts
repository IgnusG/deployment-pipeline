import { err, ok, Result, ResultAsync } from "neverthrow";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AppErr<T extends string = any> {
  identifier: T;
  message: string;
}

interface ErrorConstructor<K extends string> {
  <T>(message?: string): Result<T, AppErr<K>>;
  match: K;
  type: AppErr<K>;
}

export function AppError<K extends string>(identifier: K): ErrorConstructor<K> {
  const constructor: ErrorConstructor<K> = (message = "") => {
    return err({ identifier, message: `${identifier}: ${message}` });
  };

  constructor.match = identifier;
  constructor.type = ("" as unknown) as AppErr<K>;

  return constructor;
}

export function flatAsyncResult<T, E, T2>(
  result: Result<T, E>,
  modifier: (input: T) => Promise<Result<T2, E>>,
): ResultAsync<T2, E> {
  return result.asyncMap(modifier).andThen((res) => res);
}

export const Critical = AppError("Critical");
export const Recoverable = AppError("Recoverable");

export { err as Err, ok as Ok, Result };
