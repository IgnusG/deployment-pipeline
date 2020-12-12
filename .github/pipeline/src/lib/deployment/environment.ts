import { getValues } from "enum-util";

import { Channel, Target } from "./types";

export const Environment = getValues(Target).flatMap((target) => {
  return getValues(Channel).map((channel) => `${target}-${channel}` as const);
});

export type Environment = typeof Environment[number];

export function environmentToString(environment: Environment): string {
  return environment.replace("-", " - ");
}

export function stringToEnvironment(string: string): Environment {
  if (!Environment.includes(string as Environment))
    throw new Error(`${string} is not a valid environment. These are ${Environment.join(", ")}`);

  return string.replace(" - ", "-") as Environment;
}

export function targetAndChannelToEnvironment(target: Target, channel: Channel): Environment {
  return `${target}-${channel}` as Environment;
}

export function environmentToTargetAndChannel(environment: Environment): [Target, Channel] {
  const [target, channel] = environment.split("-") as [Target, Channel];

  if (!getValues(Target).includes(target))
    throw new Error(`${target} is not a valid target. These are ${getValues(Target).join(", ")}`);

  if (!getValues(Channel).includes(channel))
    throw new Error(`${channel} is not a valid channel. These are ${getValues(Channel).join(", ")}`);

  return [target, channel];
}
