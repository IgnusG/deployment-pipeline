import { Channel, Target, OAuth2Targets } from "./types";

export const TargetURL: Record<Target, string> = {
  [Target.Chrome]: "https://chrome.google.com/webstore/detail/",
  [Target.Firefox]: "https://addons.mozilla.org/en-US/firefox/addon/",
};

export const TargetOAuthTokenURL: Record<typeof OAuth2Targets[number], string> = {
  [Target.Chrome]: "https://www.googleapis.com/oauth2/v4/token",
};

export function getEnvironmentID(target: Target, channel: Channel): string {
  const TARGET = target.toUpperCase();
  const CHANNEL = channel.toUpperCase();

  const ID = process.env[`${TARGET}_${CHANNEL}`];

  if (ID === undefined) throw new Error(`Missing ID ${TARGET}_${CHANNEL} (env variable)`);

  return ID;
}

export const REQUIRED_OAUTH2 = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN"];
export const REQUIRED_JWT = ["ISS", "SECRET"];
