const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const backendDirectory = path.resolve(__dirname, "..");
const environment = { ...process.env, NODE_ENV: "test" };

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: backendDirectory,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNode(["scripts/setup-test-db.js"]);

const testFiles = fs
  .readdirSync(path.join(backendDirectory, "tests"))
  .filter((file) => file.endsWith(".test.js"))
  .map((file) => path.join("tests", file));

if (testFiles.length === 0) {
  throw new Error("No test files found in backend/tests.");
}

runNode([
  "--env-file=.env",
  "--test",
  "--test-force-exit",
  ...testFiles,
]);
