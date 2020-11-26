import { Octokit } from "@octokit/rest";

import env from 'dotenv';
import path from 'path';

env.config({
  path: path.resolve(process.cwd(), '../.env'),
});

const github = await new Octokit({
  auth: process.env.GITHUB_SECRET,
});

const area = {
  owner: "ignusg",
  repo: "deployment-pipeline",
};

const { data: response } = await github.repos.listDeployments(area);

const deployments = response.map(({ id }) => id);

for (const deployment of deployments) {
  try {
    await github.repos.deleteDeployment({
      ...area,
      deployment_id: deployment,
    });

    console.log('Deleted', deployment);
  } catch (error) {
    console.error('Failed with', error.message);
  }
}

console.log("All done!");
