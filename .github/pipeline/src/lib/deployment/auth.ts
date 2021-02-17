import { sign } from "jsonwebtoken";

import { REQUIRED_JWT, REQUIRED_OAUTH2, TargetOAuthTokenURL } from "./auth-config";
import { JWTTarget, JWTToken, OAuth2Target, OAuth2Token } from "./types";

export function createOAuth2Token(target: OAuth2Target): OAuth2Token {
  const TARGET = target.toUpperCase();

  const missing = REQUIRED_OAUTH2.reduce((a, req) => {
    if (process.env[`${TARGET}_OAUTH_${req}`] !== undefined) return a;

    return [...a, req];
  }, [] as string[]);

  if (missing.length > 0)
    throw new Error(`Missing tokens ${missing.map((miss) => `${TARGET}_OAUTH_${miss}`).join(", ")} (env variable)`);

  return OAuth2Token({
    request_url: TargetOAuthTokenURL[target],
    client_id: process.env[`${TARGET}_OAUTH_CLIENT_ID`] as string,
    client_secret: process.env[`${TARGET}_OAUTH_CLIENT_SECRET`] as string,
    refresh_token: process.env[`${TARGET}_OAUTH_REFRESH_TOKEN`] as string,
  });
}

export function createJWTToken(target: JWTTarget): JWTToken {
  const TARGET = target.toUpperCase();

  const missing = REQUIRED_JWT.reduce((a, req) => {
    if (process.env[`${TARGET}_JWT_${req}`] !== undefined) return a;

    return [...a, req];
  }, [] as string[]);

  if (missing.length > 0)
    throw new Error(`Missing tokens ${missing.map((miss) => `${TARGET}_JWT_${miss}`).join(", ")} (env variable)`);

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env[`${TARGET}_JWT_ISS`] as string,
    jti: Math.random().toString(),
    iat: issuedAt,
    exp: issuedAt + 60, // seconds
  };

  const token = sign(payload, process.env[`${TARGET}_JWT_SECRET`] as string, {
    algorithm: "HS256",
  });

  return token;
}
