# Pre-deployment checklist

Complete this checklist before deploying Kevintrolix RealX to a public environment.

> Reminder: create the Pinata account and JWT at this gate, before deployment—not during source implementation.

## Pinata and IPFS reminder

- [ ] Create the Pinata account before deployment.
- [ ] Generate a JWT with public file-upload permission.
- [ ] Store the JWT as the server-only `PINATA_JWT` deployment secret.
- [ ] Do not expose the JWT through a `NEXT_PUBLIC_` variable.
- [ ] Configure `NEXT_PUBLIC_IPFS_GATEWAY` with the chosen public gateway.
- [ ] Upload a real property image and confirm the returned `ipfs://` CID renders on create, cards, details, and update pages.

## Contract and network

- [ ] Run `npm run check:amoy` before deployment.
- [ ] Fund a dedicated deployment wallet with Polygon Amoy test POL.
- [ ] Deploy the contract and retain the generated deployment manifest.
- [ ] Run `npm run verify:amoy` and retain the contract and transaction explorer links.
- [ ] Set `NEXT_PUBLIC_REAL_ESTATE_CONTRACT` to the deployed address.
- [ ] Confirm the application reports Polygon Amoy chain ID `80002`.
- [ ] Verify create, update, purchase, review, like, and ownership-transfer transactions with separate test wallets.

## Release verification

- [ ] Run `npm run verify:pinata` and `npm run check:live` after configuring the live environment.
- [ ] Run `npm test` in `web3/`.
- [ ] Run `npm run test:data`, `npm run build`, and `npm run test:smoke` in `client/`.
- [ ] Confirm environment files and wallet secrets are not committed.
- [ ] Check the deployed application on desktop and mobile widths.
- [ ] Confirm `/api/health` reports the live contract and Pinata configuration without exposing credentials.
- [ ] Confirm the Stage 9 security headers and `npm run check:release` pass.
- [ ] Review privacy, contact, and other public information pages before launch.

The exact Stage 8 sequence and multi-wallet acceptance matrix are in [STAGE_8_DEPLOYMENT.md](STAGE_8_DEPLOYMENT.md).
Production hosting, health verification, and rollback are covered in [STAGE_9_PRODUCTION.md](STAGE_9_PRODUCTION.md).
