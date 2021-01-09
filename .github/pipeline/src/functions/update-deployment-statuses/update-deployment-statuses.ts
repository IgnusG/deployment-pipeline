import { Octokit } from "@octokit/rest";

import { lt } from "semver";

import { EnvironmentNotFound, queryVersion, QueryVersionErrors } from "functions/query-version/query-version";
import { Environment, stringToEnvironment } from "lib/deployment/environment";
import { AppErr, Err, Ok, Recoverable, Result } from "lib/errors";
import { GitHub } from "lib/github";
import { Deployment, DeploymentStatus } from "lib/github/types";

const deploymentSuccessful = (status: DeploymentStatus, deployment: Deployment): Result<boolean, AppErr> => {
  if (!status) {
    return Recoverable(`Deployment ${deployment.id} has no status`);
  }

  return Ok(status.state === "pending" ? false : true);
};

const createGetLatestPublishedVersion = (): (environment: Environment) => Promise<Result<string, QueryVersionErrors>> => {
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

  for (const deployment of deployments) {
    const environment = stringToEnvironment(deployment.environment);

    const result = await (async (): Promise<Result<string, AppErr>> => {
      const status = await github.latestDeploymentStatus(deployment);

      const [version] = deployment.ref.split("/").reverse();

      const deploymentStatus = deploymentSuccessful(status, deployment);

      if (deploymentStatus.isErr()) return Err(deploymentStatus.error);
      if (deploymentStatus.isOk() && deploymentStatus.value) return Ok("Deployment IS already successful");

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

      const isVersionPublished = lt(publishedVersion.value, version) ? false : true;

      if (isVersionPublished == false) return Ok(`Version ${version} is not published yet`);

      await github.successfulDeployment(deployment, `Version ${version} is published`);

      return Ok(`Deployed version ${version}`);
    })();

    result.match(
      (result) => console.log(`Deployment for ${environment} successful - ${result}`),
      (error) => console.error(`Deployment for ${environment} failed - ${error.message}`),
    );
  }
}
