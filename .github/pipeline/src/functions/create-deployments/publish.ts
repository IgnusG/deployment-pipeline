import { uploadReleaseAsset } from "./upload-release-asset";

import { environmentToTargetAndChannel } from "lib/deployment/environment";
import { Environment, isNoVerifyTarget } from "lib/deployment/types";
import { AppError, Result, Ok } from "lib/errors";
import { execute } from "lib/execute";
import { GitHub } from "lib/github";
import { Deployment } from "lib/github/types";

export const FailedToPublish = AppError("Failed to publish");
export const NoAutoPublish = AppError("Automatic publishing not available");

type PublishError = typeof FailedToPublish["type"] | typeof NoAutoPublish["type"];

export async function publish(
  environment: Environment,
  version: string,
  deployment: Deployment,
  github: GitHub,
): Promise<Result<void, PublishError>> {
  const [target, channel] = environmentToTargetAndChannel(environment);
  const [machineTarget, machineChannel] = [target.toLowerCase(), channel.toLowerCase()];

  try {
    const output = execute(`make publish target=${machineTarget} channel=${machineChannel}`);

    console.log(output);

    if (isNoVerifyTarget(target)) {
      await github.successfulDeployment(deployment, `Version ${version} is published`);
    } else {
      await github.pendingDeployment(deployment, `Version ${version} is in review`);
    }
  } catch (error) {
    const message = (error as { message: string })?.message ?? (error as string);

    if (message.includes("AUT-EXT-1")) {
      try {
        await uploadReleaseAsset(version, `${machineTarget}-${machineChannel}.zip`, github);

        await github.successfulDeployment(deployment, `Version ${version} is ready for manual publish`);
      } catch (nestedError) {
        await github.failedDeployment(deployment, `Failed to publish ${version} for ${environment}: ${message}`);

        return FailedToPublish(message);
      }

      return NoAutoPublish(`For environment ${environment}`);
    }

    await github.failedDeployment(deployment, `Failed to publish ${version} for ${environment}: ${message}`);

    return FailedToPublish(message);
  }

  return Ok(undefined);
}
