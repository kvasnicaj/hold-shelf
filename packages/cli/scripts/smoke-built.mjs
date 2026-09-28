import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["dist/bin.js", "--help"], {
	encoding: "utf8",
});

if (result.status !== 0 || !result.stdout.includes("Hold Shelf")) {
	throw new Error(`Built CLI smoke test failed: ${result.stderr || result.stdout}`);
}
