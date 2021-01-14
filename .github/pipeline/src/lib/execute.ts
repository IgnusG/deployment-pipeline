import execa from "execa";

export function execute(command: string): string {
  const { stdout, stderr } = execa.commandSync(command);

  console.log("Standard Error", stderr);

  return stdout;
}
