import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import { environmentToString } from "lib/deployment/environment";
import { Environment } from "lib/deployment/types";
import { Auth, Deployment } from "lib/github/types";

type listDeploymentProps = Omit<
  RestEndpointMethodTypes["repos"]["listDeploymentStatuses"]["parameters"],
  keyof Auth | "environment"
>;

export function listDeployments(
  auth: Auth,
  github: Octokit,
): (environment?: Environment, props?: listDeploymentProps) => Promise<Deployment[]> {
  return async (environment, props = {}) => {
    return (
      await github.repos.listDeployments({
        ...auth,
        environment: environment ? environmentToString(environment) : undefined,
        ...props,
      })
    ).data;
  };
}
