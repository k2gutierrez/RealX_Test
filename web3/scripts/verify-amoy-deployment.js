const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const EXPECTED_CHAIN_ID = 80002;
const manifestPath = path.join(__dirname, "..", "deployments", "polygon_amoy.json");
const frontendManifestPath = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "constants",
  "deployments",
  `${EXPECTED_CHAIN_ID}.json`
);

function readManifest(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} is missing: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function main() {
  const rpcUrl = String(process.env.POLYGON_AMOY_RPC_URL || "").trim();
  if (!rpcUrl || /YOUR_|placeholder|replace/i.test(rpcUrl)) {
    throw new Error("POLYGON_AMOY_RPC_URL is missing from web3/.env.");
  }

  const deployment = readManifest(manifestPath, "Contract deployment manifest");
  const frontendDeployment = readManifest(frontendManifestPath, "Frontend deployment manifest");

  if (Number(deployment.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`Deployment manifest chain ID is not ${EXPECTED_CHAIN_ID}.`);
  }
  if (!ethers.utils.isAddress(deployment.address)) {
    throw new Error("Deployment manifest contains an invalid contract address.");
  }
  if (deployment.address.toLowerCase() !== String(frontendDeployment.address).toLowerCase()) {
    throw new Error("Contract and frontend deployment manifests do not match.");
  }
  if (!Array.isArray(deployment.abi) || deployment.abi.length === 0) {
    throw new Error("Deployment manifest ABI is empty.");
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(`RPC returned chain ${network.chainId}, not Polygon Amoy.`);
  }

  const [code, receipt] = await Promise.all([
    provider.getCode(deployment.address),
    provider.getTransactionReceipt(deployment.transactionHash),
  ]);
  if (code === "0x") {
    throw new Error("No deployed bytecode exists at the manifest address.");
  }
  if (!receipt || receipt.status !== 1) {
    throw new Error("The deployment transaction is missing or unsuccessful.");
  }

  console.log("Polygon Amoy deployment verified on-chain.");
  console.log(`Contract: ${deployment.address}`);
  console.log(`Explorer: https://amoy.polygonscan.com/address/${deployment.address}`);
  console.log(`Transaction: https://amoy.polygonscan.com/tx/${deployment.transactionHash}`);
}

main().catch((error) => {
  console.error(`Deployment verification failed: ${error.message}`);
  process.exitCode = 1;
});
