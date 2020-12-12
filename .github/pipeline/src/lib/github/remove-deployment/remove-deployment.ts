import { Octokit } from "@octokit/rest";

import { Auth, Deployment } from "../types";

export function removeDeployment(auth: Auth, github: Octokit): (deployment: Deployment) => Promise<void> {
  return async (deployment) => {
    await github.repos.deleteDeployment({
      ...auth,
      deployment_id: deployment.id,
    });
  };
}
