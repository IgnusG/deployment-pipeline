import { Octokit } from "@octokit/rest";
import { getValues } from "enum-util";
import execa from "execa";

import getDeployments from "functions/get-deployments/get-deployments";

import { environmentToTargetAndChannel, targetAndChannelToEnvironment } from "lib/deployment/environment";
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

    const deployment = await getDeployments(environment, version, ref, github);

    if (deployment.isErr()) {
      console.error(deployment.error.message);

      continue;
    }

    try {
      const [target, channel] = environmentToTargetAndChannel(environment);
      const [machineTarget, machineChannel] = [target.toLowerCase(), channel.toLowerCase()];

      const { stdout } = await execa("make", ["publish", `target=${machineTarget}`, `channel=${machineChannel}`]);

      console.log(stdout);

      await github.pendingDeployment(deployment.value, `Version ${version} is in review`);
    } catch (error) {
      const message = (error as { message: string })?.message ?? (error as string);

      let description = `Failed to publish ${version}: ${message}`;

      if (description.length > 140) description = `${description.slice(0, 136)}...`;

      await github.failedDeployment(deployment.value, description);
    }
  }
}
