import { AppErr, Result } from "lib/errors";

interface ErrorHandle<K extends AppErr, T = unknown> {
  (message: string, identifier?: string): void | Result<T, K>;
}

export function matchError<
  Matchers extends {
    [key: string]: ErrorHandle<AppErr>;
  }
>(
  matchers: Matchers,
): <Matching extends AppErr>(
  matching: Matching,
) => ReturnType<
  Matchers[Matching["identifier"]] extends ErrorHandle<AppErr> ? Matchers[Matching["identifier"]] : () => undefined
>;

export function matchError<
  Matchers extends {
    [key: string]: ErrorHandle<AppErr>;
  },
  Defaults extends ErrorHandle<AppErr>
>(
  matchers: Matchers,
  defaults: Defaults | (() => undefined) = () => undefined,
): <Matching extends AppErr>(
  matching: Matching,
) => ReturnType<
  Matchers[Matching["identifier"]] extends ErrorHandle<AppErr> ? Matchers[Matching["identifier"]] : Defaults
> {
  return <
    Matching extends AppErr,
    Result extends ReturnType<
      Matchers[Matching["identifier"]] extends ErrorHandle<AppErr> ? Matchers[Matching["identifier"]] : Defaults
    >
  >(
    matching: Matching,
  ): Result => {
    const matched = matchers[matching.identifier as string];

    if (matched) return matched(matching.message) as Result;
    else return defaults(matching.message) as Result;
  };
}
