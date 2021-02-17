import { Octokit } from "@octokit/rest";
import { getValues } from "enum-util";

import { buildAndPackage } from "./build-and-package";

import { publish, FailedToPublish, NoAutoPublish } from "./publish";

import getDeployments from "functions/get-deployments/get-deployments";

import { targetAndChannelToEnvironment } from "lib/deployment/environment";
import { Channel, Target } from "lib/deployment/types";


import { GitHub } from "lib/github";

const ActionsToChannel = {
  released: Channel.Live,
  prereleased: Channel.Developer,
};

export default async function createDeployments(
  version: string,
  action: keyof typeof ActionsToChannel,
  owner: string,
  repo: string,
  ref: string,
  octokit: Octokit,
): Promise<void> {
  const github = GitHub({ owner, repo }, octokit);

  for (const target of getValues(Target)) {
    const environment = targetAndChannelToEnvironment(target, ActionsToChannel[action]);

    if (environment.isErr()) continue;

    const deployment = await getDeployments(environment.value, version, ref, github);

    if (deployment.isErr()) {
      console.error(deployment.error.message);

      continue;
    }

    const builtAndPackaged = await buildAndPackage(environment.value, version, deployment.value, github);

    if (builtAndPackaged.isErr()) {
      console.error(builtAndPackaged.error.message);

      continue;
    }

    const published = await publish(environment.value, version, deployment.value, github);

    if (published.isOk()) continue;

    switch (published.error.identifier) {
      case FailedToPublish.match: {
        console.error(published.error.message);
        break;
      }
      case NoAutoPublish.match: {
        console.warn(published.error.message);
        break;
      }
    }
  }
}
