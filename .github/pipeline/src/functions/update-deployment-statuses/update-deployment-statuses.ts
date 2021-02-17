import { Octokit } from "@octokit/rest";

import { gte } from "semver";

import { EnvironmentNotFound, queryVersion, QueryVersionErrors } from "functions/query-version/query-version";
import { Environment, VerifyEnvironment, stringToEnvironment, isNoVerifyEnvironment } from "lib/deployment/environment";
import { AppErr, Err, Ok, Recoverable, Result } from "lib/errors";
import { GitHub } from "lib/github";
import { Deployment, DeploymentStatus } from "lib/github/types";

const isDeploymentPending = (status: DeploymentStatus, deployment: Deployment): Result<boolean, AppErr> => {
  if (!status) {
    return Recoverable(`Deployment ${deployment.id} has no status`);
  }

  return Ok(status.state === "pending");
};

const createGetLatestPublishedVersion = (): (environment: VerifyEnvironment) => Promise<Result<string, QueryVersionErrors>> => {
  const publishedVersions = new Map<Environment, Result<string, QueryVersionErrors>>();

  return async (environment) => {
    if (publishedVersions.has(environment))
      return publishedVersions.get(environment) as Result<string, AppErr>;

    const publishedVersion = await queryVersion(environment);

    return publishedVersion;
  };
};

export default async function updateDeploymentStatuses(owner: string, repo: string, octokit: Octokit): Promise<void> {
  const github = GitHub({ owner, repo }, octokit);
  const deployments = await github.listDeployments();

  const getLatestPublishedVersion = createGetLatestPublishedVersion();

  await Promise.all(deployments.map(async (deployment) => {
    const environment = stringToEnvironment(deployment.environment);

    // We don't have to check no-verify environments
    if (isNoVerifyEnvironment(environment)) return;

    const result = await (async (): Promise<Result<string, AppErr>> => {
      const status = await github.latestDeploymentStatus(deployment);

      const [version] = deployment.ref.split("/").reverse();

      const deploymentPending = isDeploymentPending(status, deployment);

      if (deploymentPending.isErr()) return Err(deploymentPending.error);
      if (deploymentPending.isOk() && !deploymentPending.value)
        return Ok("Deployment is not pending");

      const publishedVersion = await getLatestPublishedVersion(environment);

      if (publishedVersion.isErr()) {
        switch (publishedVersion.error.identifier) {
          case EnvironmentNotFound.match: {
            await github.removeDeployment(deployment);

            return Ok(`Deployment for ${environment} does not exist so it was removed`);
          }
          default: {
            return publishedVersion;
          }
        }
      }

      const versionPublished = gte(publishedVersion.value, version);

      if (versionPublished == false) return Ok(`Version ${version} is not published yet`);

      await github.successfulDeployment(deployment, `Version ${version} is published`);

      return Ok(`Deployed version ${version}`);
    })();

    result.match(
      (result) => console.log(`Deployment for ${environment} successful - ${result}`),
      (error) => console.error(`Deployment for ${environment} failed - ${error.message}`),
    );
  }));
}
