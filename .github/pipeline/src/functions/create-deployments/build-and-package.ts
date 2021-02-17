import { environmentToTargetAndChannel } from "lib/deployment/environment";
import { Environment } from "lib/deployment/types";
import { AppError, AppErr, Result, Ok } from "lib/errors";
import { execute } from "lib/execute";
import { GitHub } from "lib/github";
import { Deployment } from "lib/github/types";

const FailedToBuild = AppError("Failed to build/package");

export async function buildAndPackage(
  environment: Environment,
  version: string,
  deployment: Deployment,
  github: GitHub,
): Promise<Result<void, AppErr>> {
  const [target, channel] = environmentToTargetAndChannel(environment);
  const [machineTarget, machineChannel] = [target.toLowerCase(), channel.toLowerCase()];

  try {
    const build = execute(`make build target=${machineTarget} channel=${machineChannel}`);

    console.log(build);

    const pack = execute(`make package target=${machineTarget} channel=${machineChannel}`);

    console.log(pack);
  } catch (error) {
    const message = (error as { message: string })?.message ?? (error as string);

    await github.failedDeployment(deployment, `Failed to build/package ${version} for ${environment}: ${message}`);

    return FailedToBuild(message);
  }

  return Ok(void null);
}
