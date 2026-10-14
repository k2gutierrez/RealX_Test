const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const repositoryRoot = path.join(projectRoot, "..");

const read = (filePath) => fs.readFileSync(filePath, "utf8");
const fromProject = (...parts) => path.join(projectRoot, ...parts);
const fromRepository = (...parts) => path.join(repositoryRoot, ...parts);

const gitignore = read(fromRepository(".gitignore"));
for (const requiredRule of ["client/.env.local", "web3/.env", ".env.*.local"]) {
  assert(gitignore.includes(requiredRule), `.gitignore must protect ${requiredRule}.`);
}

const clientExample = read(fromProject(".env.example"));
const web3Example = read(fromRepository("web3", ".env.example"));
assert(clientExample.includes("PINATA_JWT=YOUR_PINATA_JWT"), "Client example must contain only the Pinata placeholder.");
assert(!clientExample.includes("NEXT_PUBLIC_PINATA_JWT"), "Pinata JWT must never be exposed as NEXT_PUBLIC_PINATA_JWT.");
assert(web3Example.includes("PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY"), "Web3 example must contain only the private-key placeholder.");

const nextConfig = read(fromProject("next.config.js"));
for (const header of [
  "Content-Security-Policy",
  "Permissions-Policy",
  "Referrer-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
]) {
  assert(nextConfig.includes(header), `Missing production security header: ${header}.`);
}
assert(nextConfig.includes("poweredByHeader: false"), "The X-Powered-By header must be disabled.");

const healthRoute = read(fromProject("pages", "api", "health.js"));
assert(healthRoute.includes('status: "ok"'), "Health endpoint must report service status.");
assert(!healthRoute.includes("PRIVATE_KEY"), "Health endpoint must not access the deployer private key.");

const scanFiles = [
  fromProject(".env.example"),
  fromRepository("web3", ".env.example"),
  fromRepository("README.md"),
  fromRepository("DEPLOYMENT_CHECKLIST.md"),
  fromRepository("STAGE_8_DEPLOYMENT.md"),
];
const actualJwtPattern = /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/;
const actualPrivateKeyPattern = /PRIVATE_KEY\s*=\s*0x[0-9a-fA-F]{64}\b/;
for (const filePath of scanFiles) {
  const contents = read(filePath);
  assert(!actualJwtPattern.test(contents), `Possible JWT leaked into ${path.relative(repositoryRoot, filePath)}.`);
  assert(!actualPrivateKeyPattern.test(contents), `Possible private key leaked into ${path.relative(repositoryRoot, filePath)}.`);
}

console.log("Security checks passed: secrets, examples, health endpoint, and response-header policy.");
