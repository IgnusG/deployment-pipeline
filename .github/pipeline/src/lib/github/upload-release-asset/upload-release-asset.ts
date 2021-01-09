import fs from "fs";

import { Octokit } from "@octokit/rest";

import { Auth } from "../types";

export function uploadReleaseAsset(
  auth: Auth,
  github: Octokit,
): (tag: string, path: string, name?: string) => Promise<void> {
  return async (tag, path, name) => {
    const {
      data: { id },
    } = await github.repos.getReleaseByTag({
      ...auth,
      tag,
    });

    const fileBuffer = fs.readFileSync(path);

    await github.repos.uploadReleaseAsset({
      ...auth,
      release_id: id,
      name,
      data: fileBuffer,
    });
  };
}
