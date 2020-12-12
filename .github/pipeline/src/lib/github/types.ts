import * as ActionsCore from "@actions/core";
import { RestEndpointMethodTypes } from "@octokit/rest";

export type Deployment = RestEndpointMethodTypes["repos"]["listDeployments"]["response"]["data"][0];
export type DeploymentStatus = RestEndpointMethodTypes["repos"]["listDeploymentStatuses"]["response"]["data"][0];

export interface Auth {
  owner: string;
  repo: string;
}

export type Core = typeof ActionsCore;
