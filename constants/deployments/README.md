# Frontend deployment manifests

Persistent Hardhat deployments generate `<chainId>.json` files here. The files contain the deployed RealEstate address and exact compiled ABI for the target chain.

The application uses `NEXT_PUBLIC_REAL_ESTATE_CONTRACT` as its explicit runtime address. Stage 8's live-readiness check requires that address to match the generated `80002.json` manifest, preventing a frontend build from silently pointing at a different contract.
