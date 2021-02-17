import {
  Target,
  NoVerifyTargets,
  JWTTargets,
  OAuth2Targets,
} from "../../../config";

export {
  environmentMapping,
  Target,
  Channel,
  NoVerifyTargets,
  JWTTargets,
  OAuth2Targets,
} from "../../../config";

export {
  Environment,
  VerifyEnvironments,
  NoVerifyEnvironments,
  VerifyEnvironment,
  NoVerifyEnvironment,
} from "./environment";

export enum AuthFlow {
  OAuth2 = "OAuth2",
  JWT = "JWT",
}

export type NoVerifyTarget = typeof NoVerifyTargets[number];
export type VerifyTarget = Exclude<Target, NoVerifyTarget>;

export type OAuth2Target = typeof OAuth2Targets[number];
export type JWTTarget = typeof JWTTargets[number];


export const isNoVerifyTarget = (target: Target): target is NoVerifyTarget =>
  NoVerifyTargets.includes(target as NoVerifyTarget);

export const isOAuth2Target = (target: Target): target is OAuth2Target =>
  OAuth2Targets.includes(target as OAuth2Target);

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
