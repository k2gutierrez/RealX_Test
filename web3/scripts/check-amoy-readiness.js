const path = require("path");
const { ethers } = require("ethers");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const EXPECTED_CHAIN_ID = 80002;

function required(name) {
  const value = String(process.env[name] || "").trim();
  if (!value || /YOUR_|placeholder|replace/i.test(value)) {
    throw new Error(`${name} is missing from web3/.env.`);
  }
  return value;
}

async function main() {
  const privateKey = required("PRIVATE_KEY");
  const rpcUrl = required("POLYGON_AMOY_RPC_URL");

  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("PRIVATE_KEY must be a 32-byte 0x-prefixed test-wallet key.");
  }

  let parsedRpc;
  try {
    parsedRpc = new URL(rpcUrl);
  } catch (_) {
    throw new Error("POLYGON_AMOY_RPC_URL must be a valid HTTPS URL.");
  }
  if (parsedRpc.protocol !== "https:") {
    throw new Error("POLYGON_AMOY_RPC_URL must use HTTPS.");
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const [network, balance] = await Promise.all([
    provider.getNetwork(),
    provider.getBalance(wallet.address),
  ]);

  if (network.chainId !== EXPECTED_CHAIN_ID) {
    throw new Error(
      `RPC returned chain ${network.chainId}; Polygon Amoy must return ${EXPECTED_CHAIN_ID}.`
    );
  }
  if (balance.isZero()) {
    throw new Error("The deployment wallet has no Amoy test POL for gas.");
  }

  console.log("Polygon Amoy deployment prerequisites are ready.");
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} POL`);
}

main().catch((error) => {
  console.error(`Amoy readiness failed: ${error.message}`);
  process.exitCode = 1;
});
