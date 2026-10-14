# Kevintrolix RealX Contract

This directory contains the Solidity marketplace contract, Hardhat configuration, deployment script, and automated tests described by the tutorial.

## Commands

```bash
npm ci
npm run compile
npm test
npm run deploy:hardhat
```

For Polygon Amoy deployment, copy `.env.example` to `.env`, supply a testnet-only deployer key, and run:

```bash
npm run deploy:amoy
```

Every deployment writes `deployments/<network>.json` with the address, chain ID, transaction metadata, and compiled ABI. Persistent deployments also export a frontend copy to `client/constants/deployments/<chainId>.json`.

For a local Hardhat node, start the node in one terminal and deploy from another:

```bash
npx hardhat node
npm run deploy:local
```

## Network

- Polygon Amoy chain ID: `80002`
- Currency: POL
- Explorer: https://amoy.polygonscan.com

Never commit `.env` or use a wallet containing production funds.
