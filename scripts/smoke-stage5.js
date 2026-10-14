const { spawn } = require("child_process");

const port = 3107;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  cwd: process.cwd(),
  env: { ...process.env, PINATA_JWT: "" },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => { output += chunk.toString(); });
server.stderr.on("data", (chunk) => { output += chunk.toString(); });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitUntilReady = async () => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js exited early (${server.exitCode}).\n${output}`);
    try {
      const response = await fetch(`${origin}/create`);
      if (response.ok) return;
    } catch (_) {
      // Server is still starting.
    }
    await delay(1000);
  }
  throw new Error(`Next.js did not become ready.\n${output}`);
};

const check = async () => {
  await waitUntilReady();
  for (const route of [
    "/", "/about", "/active", "/author", "/blog", "/blogdetail", "/collection",
    "/connect", "/contact", "/create", "/creator", "/detail?id=1", "/edit-profile",
    "/explor", "/forget", "/fourm", "/login", "/news", "/privacy", "/product",
    "/ranking", "/signup", "/upcoming", "/update?id=1",
  ]) {
    const response = await fetch(`${origin}${route}`);
    if (response.status !== 200) throw new Error(`${route} returned ${response.status}.`);
    console.log(`${route} ${response.status}`);
  }

  const getResponse = await fetch(`${origin}/api/ipfs/upload`);
  if (getResponse.status !== 405) throw new Error(`Upload GET returned ${getResponse.status}.`);
  console.log(`/api/ipfs/upload GET ${getResponse.status}`);

  const postResponse = await fetch(`${origin}/api/ipfs/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "bad.txt", type: "text/plain", dataUrl: "data:text/plain;base64,SGVsbG8=" }),
  });
  if (postResponse.status !== 503) throw new Error(`Unconfigured upload returned ${postResponse.status}.`);
  console.log(`/api/ipfs/upload without PINATA_JWT ${postResponse.status}`);

  const healthResponse = await fetch(`${origin}/api/health`);
  if (healthResponse.status !== 200) throw new Error(`Health endpoint returned ${healthResponse.status}.`);
  const health = await healthResponse.json();
  if (health.status !== "ok" || health.chainId !== 80002) throw new Error("Health endpoint returned an invalid payload.");
  console.log(`/api/health ${healthResponse.status}`);

  const healthPost = await fetch(`${origin}/api/health`, { method: "POST" });
  if (healthPost.status !== 405) throw new Error(`Health POST returned ${healthPost.status}.`);
  console.log(`/api/health POST ${healthPost.status}`);

  for (const header of [
    "content-security-policy",
    "permissions-policy",
    "referrer-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
  ]) {
    if (!healthResponse.headers.get(header)) throw new Error(`Security header ${header} is missing.`);
  }
  if (healthResponse.headers.get("x-powered-by")) throw new Error("X-Powered-By must not be exposed.");
  console.log("production security headers present");

  const notFound = await fetch(`${origin}/route-that-does-not-exist`);
  if (notFound.status !== 404) throw new Error(`Unknown route returned ${notFound.status}.`);
  console.log(`/404 behavior ${notFound.status}`);

  if (process.env.HOLD_BROWSER === "1") {
    console.log(`Preview ready at ${origin}`);
    await new Promise((resolve) => setTimeout(resolve, 120000));
  }
};

check()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill();
  });
