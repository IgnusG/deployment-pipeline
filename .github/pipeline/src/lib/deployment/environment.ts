import { getValues } from "enum-util";

import {
  environmentMapping,
  Channel,
  Target,
  NoVerifyTargets,
  NoVerifyTarget,
  VerifyTarget,
  isNoVerifyTarget,
} from "./types";

import { AppError, Ok, Result } from "lib/errors";

type EnvironmentBuilder<T extends Target> = typeof environmentMapping extends Record<infer G, infer K>
? G extends T
  ? K extends typeof environmentMapping[G]
    ? `${G}-${K[number]}`
    : never
  : never
: never;

function buildEnvironments<T extends Environment>(filter: (target: Target) => boolean = () => true): readonly T[] {
  return Object.keys(environmentMapping)
    .filter((target) => filter(target as Target))
    .flatMap(
      (target) =>
        (environmentMapping[target as keyof typeof environmentMapping] as unknown as string[]).map(
          (channel) => `${target}-${channel}`,
        ),
    ) as T[];
}

export type Environment = EnvironmentBuilder<Target>;
export const Environments = buildEnvironments<Environment>();

export type NoVerifyEnvironment = EnvironmentBuilder<NoVerifyTarget>;
export const NoVerifyEnvironments = buildEnvironments<NoVerifyEnvironment>(
  (target) => NoVerifyTargets.includes(target as NoVerifyTarget),
);

export type VerifyEnvironment = EnvironmentBuilder<VerifyTarget>;
export const VerifyEnvironments = buildEnvironments<VerifyEnvironment>(
  (target) => !NoVerifyTargets.includes(target as NoVerifyTarget),
);

export const isNoVerifyEnvironment = (environment: Environment): environment is NoVerifyEnvironment =>
  isNoVerifyTarget(environmentToTargetAndChannel(environment)[0]);

export function environmentToString(environment: Environment): string {
  return environment.replace("-", " - ");
}

export function stringToEnvironment(string: string): Environment {
  const environment = string.replace(" - ", "-");

  if (!Environments.includes(environment as Environment))
    throw new Error(`${environment} is not a valid environment. These are ${Environments.join(", ")}`);

  return environment as Environment;
}

const UnsupportedEnv = AppError("Environment not supported");

export function targetAndChannelToEnvironment(
  target: Target,
  channel: Channel,
): Result<Environment, typeof UnsupportedEnv["type"]> {
  const environment = `${target}-${channel}` as Environment;

  if (!Environments.includes(environment)) return UnsupportedEnv(environment);

  return Ok(environment);
}

export function environmentToTargetAndChannel(environment: NoVerifyEnvironment): [NoVerifyTarget, Channel];
export function environmentToTargetAndChannel(environment: VerifyEnvironment): [VerifyTarget, Channel];
export function environmentToTargetAndChannel(environment: Environment): [Target, Channel];

export function environmentToTargetAndChannel(environment: Environment): [Target, Channel] {
  const [target, channel] = environment.split("-") as [Target, Channel];

  if (!getValues(Target).includes(target))
    throw new Error(`${target} is not a valid target. These are ${getValues(Target).join(", ")}`);

  if (!getValues(Channel).includes(channel))
    throw new Error(`${channel} is not a valid channel. These are ${getValues(Channel).join(", ")}`);

  return [target, channel];
}
