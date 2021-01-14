import { existsSync } from "fs";
import { join } from "path";

import { Octokit } from "@octokit/rest";
import { getValues } from "enum-util";

import getDeployments from "functions/get-deployments/get-deployments";

import { Environment, environmentToTargetAndChannel, targetAndChannelToEnvironment } from "lib/deployment/environment";
import { Channel, Target } from "lib/deployment/types";

import { AppErr, AppError, Ok, Result } from "lib/errors";
import { execute } from "lib/execute";
import { GitHub } from "lib/github";
import { Deployment } from "lib/github/types";

const ActionsToChannel = {
  released: Channel.Live,
  prereleased: Channel.Developer,
};

const uploadReleaseAsset = async (tag: string, filename: string, github: GitHub): Promise<void> => {
  if (!process.env.ASSET_PATH) return console.error("Cannot upload release asset: Missing ASSET_PATH");
  if (!process.env.GITHUB_WORKSPACE) return console.error("Cannot upload release asset: GITHUB_WORKSPACE not defined?");

  const filePath = join(process.env.GITHUB_WORKSPACE, process.env.ASSET_PATH, filename);

  if (!existsSync(filePath)) return;

  await github.uploadReleaseAsset(tag, filePath, filename);
};

const FailedToBuild = AppError("Failed to build/package");

async function buildAndPackage(
  environment: Environment,
  version: string,
  deployment: Deployment,
  github: GitHub,
): Promise<Result<void, AppErr>> {
  const [target, channel] = environmentToTargetAndChannel(environment);
  const [machineTarget, machineChannel] = [target.toLowerCase(), channel.toLowerCase()];

  try {
    const build = await execute(`make build target=${machineTarget} channel=${machineChannel}`);

    console.log(build);

    const pack = await execute(`make package target=${machineTarget} channel=${machineChannel}`);

    console.log(pack);
  } catch (error) {
    const message = (error as { message: string })?.message ?? (error as string);
    let description = `Failed to build/package ${version} for ${environment}: ${message}`;

    if (description.length > 140) description = `${description.slice(0, 136)}...`;

    await github.failedDeployment(deployment, description);

    return FailedToBuild(message);
  }

  return Ok(void null);
}

const FailedToPublish = AppError("Failed to publish");
const NoAutoPublish = AppError("Automatic publishing not available");

type PublishError = typeof FailedToPublish["type"] | typeof NoAutoPublish["type"];

async function publish(
  environment: Environment,
  version: string,
  deployment: Deployment,
  github: GitHub,
): Promise<Result<void, PublishError>> {
  const [target, channel] = environmentToTargetAndChannel(environment);
  const [machineTarget, machineChannel] = [target.toLowerCase(), channel.toLowerCase()];

  try {
    const output = await execute(`make publish target=${machineTarget} channel=${machineChannel}`);

    console.log(output);

    await uploadReleaseAsset(version, `${machineTarget}-${machineChannel}.zip`, github);

    await github.pendingDeployment(deployment, `Version ${version} is in review`);
  } catch (error) {
    const message = (error as { message: string })?.message ?? (error as string);

    if (message.includes("AUT-EXT-1")) {
      await github.successfulDeployment(deployment, `Version ${version} is ready for manual publish`);

      return NoAutoPublish(`For environment ${environment}`);
    }

    let description = `Failed to publish ${version} for ${environment}: ${message}`;

    if (description.length > 140) description = `${description.slice(0, 136)}...`;

    await github.failedDeployment(deployment, description);

    return FailedToPublish(message);
  }

  return Ok(undefined);
}

export default async function createDeployments(
  version: string,
  action: keyof typeof ActionsToChannel,
  owner: string,
  repo: string,
  ref: string,
  octokit: Octokit,
): Promise<void> {
  const github = GitHub({ owner, repo }, octokit);

  for (const target of getValues(Target)) {
    const environment = targetAndChannelToEnvironment(target, ActionsToChannel[action]);
    const deployment = await getDeployments(environment, version, ref, github);

    if (deployment.isErr()) {
      console.error(deployment.error.message);

      continue;
    }

    const builtAndPackaged = await buildAndPackage(environment, version, deployment.value, github);

    if (builtAndPackaged.isErr()) {
      console.error(builtAndPackaged.error.message);

      continue;
    }

    const published = await publish(environment, version, deployment.value, github);

    if (published.isOk()) continue;

    switch (published.error.identifier) {
      case FailedToPublish.match: {
        console.error(published.error.message);
        break;
      }
      case NoAutoPublish.match: {
        console.warn(published.error.message);
        break;
      }
    }
  }
}
