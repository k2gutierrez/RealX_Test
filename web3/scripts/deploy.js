const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      `No deployer is configured for ${hre.network.name}. Add PRIVATE_KEY to web3/.env for Polygon Amoy.`
    );
  }

  const network = await hre.ethers.provider.getNetwork();
  const balance = await deployer.getBalance();
  if (hre.network.name === "polygon_amoy" && network.chainId !== 80002) {
    throw new Error(`Polygon Amoy deployment expected chain 80002, but the RPC returned ${network.chainId}.`);
  }
  if (hre.network.name === "polygon_amoy" && balance.isZero()) {
    throw new Error("The Polygon Amoy deployer has no test POL for deployment gas.");
  }

  console.log(`Deploying RealEstate from: ${deployer.address}`);
  console.log(`Network: ${hre.network.name} (chain ${network.chainId})`);

  const RealEstate = await hre.ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();
  const receipt = await realEstate.deployTransaction.wait();
  const artifact = await hre.artifacts.readArtifact("RealEstate");
  const deployedCode = await hre.ethers.provider.getCode(realEstate.address);
  if (deployedCode === "0x" || receipt.status !== 1) {
    throw new Error("Deployment transaction completed without verified contract bytecode.");
  }

  const deployment = {
    contractName: "RealEstate",
    address: realEstate.address,
    network: hre.network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    transactionHash: realEstate.deployTransaction.hash,
    blockNumber: receipt.blockNumber,
    deployedAt: new Date().toISOString(),
    abi: artifact.abi,
  };

  const contractDeploymentPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${hre.network.name}.json`
  );
  writeJson(contractDeploymentPath, deployment);

  if (hre.network.name !== "hardhat") {
    const frontendDeploymentPath = path.join(
      __dirname,
      "..",
      "..",
      "client",
      "constants",
      "deployments",
      `${network.chainId}.json`
    );
    writeJson(frontendDeploymentPath, deployment);
    console.log(`Frontend deployment manifest: ${frontendDeploymentPath}`);
  }

  console.log(`RealEstate deployed to: ${realEstate.address}`);
  console.log(`Deployment manifest: ${contractDeploymentPath}`);
  console.log(`NEXT_PUBLIC_REAL_ESTATE_CONTRACT=${realEstate.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
