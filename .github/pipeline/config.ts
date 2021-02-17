/** Targets that will be deployed on (pre)-release */
export enum Target {
  Firefox = "Firefox",
  Chrome = "Chrome",
  Web = "WebApp",
}

/** Developer is published as pre-release and Live as release */
export enum Channel {
  Live = "Live",
  Developer = "Developer",
}

/** Which targets support which channels */
export const environmentMapping = {
  [Target.Chrome]: [Channel.Live, Channel.Developer],
  [Target.Firefox]: [Channel.Live],
  [Target.Web]: [Channel.Live],
 } as const;

 /** These targets will be immediately marked as successful and not be verified */
export const NoVerifyTargets = [Target.Web] as const;

/** An OAuth token verification will be used to check the publish status */
export const OAuth2Targets = [Target.Chrome] as const;
/** A JWT token verification will be used to check the publish status */
export const JWTTargets = [Target.Firefox] as const;
