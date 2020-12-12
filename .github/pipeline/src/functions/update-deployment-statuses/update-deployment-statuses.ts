import { Octokit } from "@octokit/rest";

import { lt } from "semver";

import { queryVersion } from "functions/query-version/query-version";
import { stringToEnvironment } from "lib/deployment/environment";
import { AppErr, Err, flatAsyncResult, Ok, Recoverable, Result } from "lib/errors";
import { GitHub } from "lib/github";
import { Deployment, DeploymentStatus } from "lib/github/types";

const deploymentSuccessful = (status: DeploymentStatus, deployment: Deployment): Result<boolean, AppErr> => {
  if (!status) {
    return Recoverable(`Deployment ${deployment.id} has no status`);
  }

  return Ok(status.state === "pending" ? false : true);
};

const versionPublished = async (
  publishedVersion: string | null | undefined,
  version: string,
  deployment: Deployment,
  github: ReturnType<typeof GitHub>,
): Promise<Result<boolean, AppErr>> => {
  if (!publishedVersion) return Recoverable("Published Version is not available");

  const environment = stringToEnvironment(deployment.environment);

  if (publishedVersion === "") {
    await github.removeDeployment(deployment);

    return Recoverable(`Environment ${environment} does not exist`);
  }

  return lt(publishedVersion, version) ? Ok(false) : Ok(true);
};

export default async function updateDeploymentStatuses(owner: string, repo: string, octokit: Octokit): Promise<void> {
  const github = GitHub({ owner, repo }, octokit);
  const deployments = await github.listDeployments();

  for (const deployment of deployments) {
    const environment = stringToEnvironment(deployment.environment);

    const result = await (async (): Promise<Result<string, AppErr>> => {
      const status = await github.latestDeploymentStatus(deployment);

      const [version] = deployment.ref.split("/").reverse();

      const deploymentStatus = deploymentSuccessful(status, deployment);

      if (deploymentStatus.isErr()) return Err(deploymentStatus.error);
      if (deploymentStatus.isOk() && deploymentStatus.value) return Ok("Deployment IS already successful");

      const publishedVersion = await queryVersion(environment);
      const isVersionPublished = await flatAsyncResult(publishedVersion, (published) =>
        versionPublished(published, version, deployment, github),
      );

      if (isVersionPublished.isErr()) return Err(isVersionPublished.error);
      if (isVersionPublished.value == false) return Ok(`Version ${version} IS already published`);

      await github.successfulDeployment(deployment, `Version ${version} is published`);

      return Ok(`Deployed version ${version}`);
    })();

    result.match(
      (result) => console.log(`Deployment for ${environment} successful - ${result}`),
      (error) => console.error(`Deployment for ${environment} failed - ${error.message}`),
    );
  }
}
