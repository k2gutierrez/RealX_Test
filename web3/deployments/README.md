# Contract deployment manifests

`scripts/deploy.js` writes one JSON manifest per network to this directory. Each manifest contains the contract address, chain ID, deployer, transaction metadata, and the exact compiled ABI.

- `hardhat.json` is an ephemeral deployment used only to verify the script.
- `localhost.json` describes a deployment to a running local Hardhat node.
- `polygon_amoy.json` describes the testnet deployment used by the client.

Persistent-network deployments also create a matching frontend manifest under `client/constants/deployments/<chainId>.json`.
