import { Octokit } from "@octokit/rest";

import {
  failedDeployment,
  pendingDeployment,
  successfulDeployment,
} from "./create-deployment-status/create-deployment-status";
import { latestDeploymentStatus } from "./latest-deployment-status/latest-deployment-status";
import { removeDeployment } from "./remove-deployment/remove-deployment";
import { Auth } from "./types";

import { createDeployment } from "lib/github/create-deployment/create-deployment";
import { listDeployments } from "lib/github/list-deployments/list-deployments";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function GitHub(auth: Auth, github: Octokit) {
  return {
    latestDeploymentStatus: latestDeploymentStatus(auth, github),
    removeDeployment: removeDeployment(auth, github),
    createDeployment: createDeployment(auth, github),
    successfulDeployment: successfulDeployment(auth, github),
    pendingDeployment: pendingDeployment(auth, github),
    failedDeployment: failedDeployment(auth, github),
    listDeployments: listDeployments(auth, github),
  };
}
