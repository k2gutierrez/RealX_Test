# Client data services

Stage 3 keeps the original React context API while separating deterministic responsibilities:

- `web3.js` — providers, contracts, Polygon Amoy switching, explorer links, and wallet error parsing.
- `normalizers.js` — stable property/review objects for demo records and Solidity tuple results.
- `storage.js` — versioned demo-mode persistence with legacy-key migration.
- `validation.js` — shared property and review validation used before demo or blockchain writes.

Run `npm run test:data` from `client/` for deterministic checks that do not require a wallet or network connection.
