const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");

function readJwt() {
  if (!fs.existsSync(envPath)) throw new Error("client/.env.local is missing.");
  const entry = fs.readFileSync(envPath, "utf8").split(/\r?\n/)
    .find((line) => /^\s*PINATA_JWT\s*=/.test(line));
  const jwt = String(entry ? entry.split("=").slice(1).join("=") : "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (!jwt || /YOUR_|placeholder|replace/i.test(jwt)) {
    throw new Error("PINATA_JWT is missing from client/.env.local.");
  }
  return jwt;
}

async function main() {
  const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
    headers: { Authorization: `Bearer ${readJwt()}` },
  });
  if (!response.ok) {
    throw new Error(`Pinata authentication returned HTTP ${response.status}.`);
  }
  console.log("Pinata authentication verified. The JWT was not displayed.");
}

main().catch((error) => {
  console.error(`Pinata verification failed: ${error.message}`);
  process.exitCode = 1;
});
