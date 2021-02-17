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


export type Environment = typeof environmentMapping extends Record<infer G, infer K>
  ? G extends Target
    ? K extends typeof environmentMapping[G]
      ? `${G}-${K[number]}`
      : never
    : never
  : never;

export const Environments = Object.entries(environmentMapping).flatMap(
  ([target, channels]) => channels.map((channel: Channel) => `${target}-${channel}`) as string[],
) as Environment[];

export type NoVerifyEnvironment = typeof environmentMapping extends Record<infer G, infer K>
  ? G extends NoVerifyTarget
    ? K extends typeof environmentMapping[G]
      ? `${G}-${K[number]}`
      : never
    : never
  : never;

export const NoVerifyEnvironments = Object.keys(environmentMapping)
  .filter((target) => NoVerifyTargets.includes(target as NoVerifyTarget))
  .flatMap(
    (target) =>
      environmentMapping[target as keyof typeof environmentMapping].map(
        (channel: Channel) => `${target}-${channel}`,
      ) as string[],
  ) as NoVerifyEnvironment[];

export const isNoVerifyEnvironment = (environment: Environment): environment is NoVerifyEnvironment =>
  isNoVerifyTarget(environmentToTargetAndChannel(environment)[0]);

export type VerifyEnvironment = typeof environmentMapping extends Record<infer G, infer K>
  ? G extends VerifyTarget
    ? K extends typeof environmentMapping[G]
      ? `${G}-${K[number]}`
      : never
    : never
  : never;

export const VerifyEnvironments = Object.keys(environmentMapping)
  .filter((target) => !NoVerifyTargets.includes(target as NoVerifyTarget))
  .flatMap(
    (target) =>
      environmentMapping[target as keyof typeof environmentMapping].map(
        (channel: Channel) => `${target}-${channel}`,
      ) as string[],
  ) as VerifyEnvironment[];

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
