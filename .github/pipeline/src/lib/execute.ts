import execa from "execa";

export async function execute(command: string): Promise<string> {
  const [cmd, ...parameters] = command.split(" ");

  const { stdout } = await execa(cmd, parameters);

  return stdout;
}
