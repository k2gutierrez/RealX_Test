require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const RAW_PRIVATE_KEY = String(process.env.PRIVATE_KEY || "").trim();
const PRIVATE_KEY = /^0x[0-9a-fA-F]{64}$/.test(RAW_PRIVATE_KEY) ? RAW_PRIVATE_KEY : undefined;
const RPC_URL = process.env.POLYGON_AMOY_RPC_URL || "https://polygon-amoy.drpc.org";
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    polygon_amoy: {
      chainId: 80002,
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  solidity: {
    version: "0.8.26",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
