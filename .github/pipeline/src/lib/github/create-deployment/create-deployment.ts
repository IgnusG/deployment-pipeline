import { Octokit } from "@octokit/rest";

import { environmentToString } from "lib/deployment/environment";
import { Environment } from "lib/deployment/types";
import { Auth, Deployment } from "lib/github/types";

export function createDeployment(
  auth: Auth,
  github: Octokit,
): (ref: string, environment: Environment) => Promise<Deployment> {
  return async (ref, environment) => {
    return (
      await github.repos.createDeployment({
        ...auth,
        ref,
        required_contexts: [],
        environment: environmentToString(environment),
      })
    ).data as Deployment;
  };
}
