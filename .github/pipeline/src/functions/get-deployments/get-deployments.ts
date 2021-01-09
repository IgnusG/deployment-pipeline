import { gt, lt } from "semver";

import { Environment } from "lib/deployment/types";
import { AppErr, AppError, Ok, Result } from "lib/errors";
import { GitHub } from "lib/github";
import { Deployment } from "lib/github/types";

export const PublishedVersionIsNewer = AppError("Published version is newer");
export const VersionAlreadyPublished = AppError("Version is already published");
export const DeploymentRefMismatch = AppError("Deployment Ref does not match the release ref");

export type GetDeploymentsErrors = typeof PublishedVersionIsNewer.type | typeof VersionAlreadyPublished.type | typeof DeploymentRefMismatch.type;

export default async function getDeployments(
  environment: Environment,
  version: string,
  ref: string,
  github: ReturnType<typeof GitHub>,
): Promise<Result<Deployment, GetDeploymentsErrors>> {
  const deployments = await github.listDeployments(environment);

  if (!deployments.length) {
    return Ok(await github.createDeployment(ref, environment));
  }

  const [latestDeployment] = deployments.reverse();
  const [latestVersion] = latestDeployment.ref.split("/").reverse();

  if (lt(version, latestVersion)) {
    return PublishedVersionIsNewer(`${version} is older than the currently published ${latestVersion}`);
  }

  if (gt(version, latestVersion)) {
    return Ok(await github.createDeployment(ref, environment));
  }

  if (latestDeployment.ref !== ref) {
    return DeploymentRefMismatch(`Last deployment's ${latestDeployment.ref} should have been equal to ${ref}`);
  }

  const status = await github.latestDeploymentStatus(latestDeployment);

  if (["error", "failure"].includes(status.state)) {
    return Ok(latestDeployment);
  }

  return VersionAlreadyPublished(`Version ${version} seems to already have been deployed on ${environment}`);
}
