import { existsSync } from "fs";
import { join } from "path";

import { GitHub } from "lib/github";

export async function uploadReleaseAsset(tag: string, filename: string, github: GitHub): Promise<void> {
  if (!process.env.ASSET_PATH) return console.error("Cannot upload release asset: Missing ASSET_PATH");
  if (!process.env.GITHUB_WORKSPACE) return console.error("Cannot upload release asset: GITHUB_WORKSPACE not defined?");

  const filePath = join(process.env.GITHUB_WORKSPACE, process.env.ASSET_PATH, filename);

  if (!existsSync(filePath)) return;

  await github.uploadReleaseAsset(tag, filePath, filename);
}
