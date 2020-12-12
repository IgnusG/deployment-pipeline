export enum Target {
  Firefox = "Firefox",
  Chrome = "Chrome",
}

export enum Channel {
  Live = "Live",
  Developer = "Developer",
}

export { Environment } from "./environment";

export enum AuthFlow {
  OAuth2 = "OAuth2",
  JWT = "JWT",
}

export const OAuth2Targets = [Target.Chrome] as const;
export type OAuth2Target = typeof OAuth2Targets[number];

export const isOAuth2Target = (target: Target): target is OAuth2Target =>
  OAuth2Targets.includes(target as OAuth2Target);

export const JWTTargets = [Target.Firefox] as const;
export type JWTTarget = typeof JWTTargets[number];

export const isJWTTarget = (target: Target): target is JWTTarget => JWTTargets.includes(target as JWTTarget);

export interface OAuth2Token {
  request_url: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
  grant_type: "refresh_token";
}

export function OAuth2Token(props: Omit<OAuth2Token, "grant_type">): OAuth2Token {
  return {
    ...props,
    grant_type: "refresh_token",
  };
}

export type JWTToken = string;
