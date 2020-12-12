import fetch from "node-fetch";

import { createJWTToken, createOAuth2Token } from "lib/deployment/auth";
import { getEnvironmentID, TargetURL } from "lib/deployment/config";
import { environmentToTargetAndChannel } from "lib/deployment/environment";
import {
  Channel,
  Environment,
  isJWTTarget,
  isOAuth2Target,
  JWTTarget,
  OAuth2Target,
  Target,
} from "lib/deployment/types";
import { AppErr, AppError, Ok, Result } from "lib/errors";

interface TokenResponse {
  access_token: string;
}

export const EnvironmentNotFound = AppError("Environment not found");
export const VersionQueryFailed = AppError("Version query failed");
export const VersionNotFound = AppError("Version not found");

async function fetchWithOAuth2(target: OAuth2Target, channel: Channel): Promise<string> {
  const { request_url, ...payload } = createOAuth2Token(target);

  const response = await fetch(request_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const { access_token } = (await response.json()) as TokenResponse;

  return fetchWithoutToken(target, channel, {
    Authorization: `Bearer ${access_token}`,
  });
}

async function fetchWithJWT(target: JWTTarget, channel: Channel): Promise<string> {
  const token = createJWTToken(target);

  return fetchWithoutToken(target, channel, {
    Authorization: `JWT ${token}`,
  });
}

async function fetchWithoutToken(target: Target, channel: Channel, headers = {}): Promise<string> {
  const response = await fetch(`${TargetURL[target]}/${getEnvironmentID(target, channel)}`, {
    headers,
  });
  const result = await response.text();

  return result;
}

async function fetchListing(environment: Environment): Promise<string> {
  const [target, channel] = environmentToTargetAndChannel(environment);

  if (channel === Channel.Developer) {
    if (isJWTTarget(target)) return fetchWithJWT(target, channel);

    if (isOAuth2Target(target)) return fetchWithOAuth2(target, channel);

    throw new Error(`Developer Channel selected, but authorization for target ${target as string} is not supported`);
  } else {
    return fetchWithoutToken(target, channel);
  }
}

export async function queryVersion(environment: Environment): Promise<Result<string | null, AppErr>> {
  try {
    const listing = await fetchListing(environment);

    if (listing === "") return EnvironmentNotFound(environment);

    const result = /<meta itemprop="version" content="(?'version'[^"]*)"\/>/.exec(listing);

    if (result === null) return VersionNotFound();

    const version = result.groups?.version;

    if (version === undefined) return VersionNotFound();

    return Ok(version);
  } catch (error) {
    return VersionQueryFailed(error);
  }
}
