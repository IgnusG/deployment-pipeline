import { Channel, Target, OAuth2Target, VerifyTarget } from "./types";

export const TargetURL: Record<VerifyTarget, string> = {
  [Target.Chrome]: "https://chrome.google.com/webstore/detail/",
  [Target.Firefox]: "https://addons.mozilla.org/en-US/firefox/addon/",
};

export const TargetOAuthTokenURL: Record<OAuth2Target[number], string> = {
  [Target.Chrome]: "https://www.googleapis.com/oauth2/v4/token",
};

export function getEnvironmentID(target: Target, channel: Channel): string {
  const TARGET = target.toUpperCase();
  const CHANNEL = channel.toUpperCase();

  const ID = process.env[`${TARGET}_${CHANNEL}_ID`];

  if (ID === undefined) throw new Error(`Missing ID ${TARGET}_${CHANNEL}_ID (env variable)`);

  return ID;
}

export const REQUIRED_OAUTH2 = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN"];
export const REQUIRED_JWT = ["ISS", "SECRET"];
