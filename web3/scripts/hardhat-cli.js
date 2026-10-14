const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const env = { ...process.env };

// Some Windows/OneDrive setups expose Hardhat's default APPDATA config path
// as a file instead of a directory. Keep Hardhat's local metadata inside this
// workspace so the documented npm commands remain reproducible.
if (process.platform === "win32") {
  env.APPDATA = path.join(__dirname, "..", ".hardhat-appdata");
  fs.mkdirSync(env.APPDATA, { recursive: true });
}

const cli = require.resolve("hardhat/internal/cli/cli");
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
