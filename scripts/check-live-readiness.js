const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const { createReadProvider } = require("../services/web3");

const projectRoot = path.join(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const manifestPath = path.join(projectRoot, "constants", "deployments", "80002.json");

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("client/.env.local is missing.");
  }
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).reduce((values, line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) return values;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
    return values;
  }, {});
}

function required(values, name) {
  const value = String(values[name] || "").trim();
  if (!value || /YOUR_|placeholder|replace/i.test(value)) {
    throw new Error(`${name} is missing from client/.env.local.`);
  }
  return value;
}

function requireHttps(value, name) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch (_) {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }
  if (parsed.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
}

async function main() {
  const values = parseEnv(envPath);
  const address = required(values, "NEXT_PUBLIC_REAL_ESTATE_CONTRACT");
  const rpcUrl = required(values, "NEXT_PUBLIC_POLYGON_AMOY_RPC_URL");
  const gateway = required(values, "NEXT_PUBLIC_IPFS_GATEWAY");
  required(values, "PINATA_JWT");

  if (!ethers.utils.isAddress(address) || address === ethers.constants.AddressZero) {
    throw new Error("NEXT_PUBLIC_REAL_ESTATE_CONTRACT is not a valid deployed address.");
  }
  requireHttps(rpcUrl, "NEXT_PUBLIC_POLYGON_AMOY_RPC_URL");
  requireHttps(gateway, "NEXT_PUBLIC_IPFS_GATEWAY");
  if (Object.prototype.hasOwnProperty.call(values, "NEXT_PUBLIC_PINATA_JWT")) {
    throw new Error("Remove NEXT_PUBLIC_PINATA_JWT; the Pinata credential must remain server-only.");
  }
  if (!fs.existsSync(manifestPath)) {
    throw new Error("client/constants/deployments/80002.json is missing; deploy the contract first.");
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (Number(manifest.chainId) !== 80002) throw new Error("Frontend manifest chain ID is not 80002.");
  if (String(manifest.address).toLowerCase() !== address.toLowerCase()) {
    throw new Error("The frontend environment address does not match its deployment manifest.");
  }
  if (!Array.isArray(manifest.abi) || manifest.abi.length === 0) {
    throw new Error("Frontend deployment manifest ABI is empty.");
  }

  const provider = createReadProvider({
    chainId: "0x13882",
    chainName: "Polygon Amoy",
    rpcUrls: [rpcUrl, "https://polygon-amoy.drpc.org"],
  });
  const [network, code] = await Promise.all([
    provider.getNetwork(),
    provider.getCode(address),
  ]);
  if (network.chainId !== 80002) {
    throw new Error(`Frontend RPC returned chain ${network.chainId}, not Polygon Amoy.`);
  }
  if (code === "0x") {
    throw new Error("The frontend contract address has no bytecode on Polygon Amoy.");
  }

  console.log("Frontend live configuration is ready.");
  console.log(`Contract: ${address}`);
  console.log("Pinata JWT: configured server-side");
  console.log("Polygon Amoy chain ID: 80002");
}

main().catch((error) => {
  console.error(`Live readiness failed: ${error.message}`);
  process.exitCode = 1;
});
