import { Octokit } from "@octokit/rest";

import { Auth, Deployment } from "../types";

function sliceDescription(description: string): string {
  if (description.length > 140) return `${description.slice(0, 136)}...`;

  return description;
}

export function failedDeployment(
  auth: Auth,
  github: Octokit,
): (deployment: Deployment, message: string, logs?: string) => Promise<void> {
  return async (deployment, message, logs) => {
    await github.repos.createDeploymentStatus({
      ...auth,
      deployment_id: deployment.id,
      state: "error",
      description: sliceDescription(message),
      log_url: logs,
    });
  };
}

export function pendingDeployment(
  auth: Auth,
  github: Octokit,
): (deployment: Deployment, message: string) => Promise<void> {
  return async (deployment, message) => {
    await github.repos.createDeploymentStatus({
      ...auth,
      deployment_id: deployment.id,
      state: "pending",
      description: sliceDescription(message),
    });
  };
}

export function successfulDeployment(
  auth: Auth,
  github: Octokit,
): (deployment: Deployment, message: string) => Promise<void> {
  return async (deployment, message) => {
    await github.repos.createDeploymentStatus({
      ...auth,
      deployment_id: deployment.id,
      state: "success",
      description: sliceDescription(message),
    });
  };
}
