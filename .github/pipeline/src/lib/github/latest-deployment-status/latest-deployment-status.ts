import { Octokit } from "@octokit/rest";

import { Deployment, Auth, DeploymentStatus } from "../types";

export function latestDeploymentStatus(
  auth: Auth,
  github: Octokit,
): (deployment: Deployment) => Promise<DeploymentStatus> {
  return async (deployment) => {
    const { data: status } = await github.repos.listDeploymentStatuses({
      ...auth,
      deployment_id: deployment.id,
    });

    const [latestStatus] = status.reverse();

    return latestStatus;
  };
}
