const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const backendDir = path.resolve(__dirname, "..");

function runAppCheck(enableLabs) {
  return spawnSync(
    process.execPath,
    [
      "--env-file=.env",
      "-e",
      `
        const request = require("supertest");
        const app = require("./src/app");

        Promise.all([
          request(app).get("/api/labs/sqli"),
          request(app).get("/api/labs/csrf/state")
        ])
          .then(([sqli, csrf]) => {
            if (sqli.status === 404 && csrf.status === 404) {
              process.exit(0);
            }
            process.exit(1);
          })
          .catch(() => process.exit(1));
      `,
    ],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        NODE_ENV: "production",
        ENABLE_SECURITY_LABS: enableLabs ? "true" : "false",
      },
      encoding: "utf8",
      timeout: 10000,
    }
  );
}

test("Production - Reject enabled Security Labs", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--env-file=.env",
      "-e",
      'require("./src/app")',
    ],
    {
      cwd: backendDir,
      env: {
        ...process.env,
        NODE_ENV: "production",
        ENABLE_SECURITY_LABS: "true",
      },
      encoding: "utf8",
      timeout: 10000,
    }
  );

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /Security Labs must not be enabled in production/
  );
});

test("Production - Keep Security Labs disabled", () => {
  const result = runAppCheck(false);

  assert.equal(
    result.status,
    0,
    result.stderr || result.stdout
  );
});