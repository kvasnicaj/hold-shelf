#!/usr/bin/env node
import { runCli } from "./cli.js";

process.once("SIGINT", () => {
	process.exit(130);
});

process.exitCode = await runCli(process.argv);
