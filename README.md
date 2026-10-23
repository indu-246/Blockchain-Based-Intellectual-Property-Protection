# Blockchain-Based-Intellectual-Property-Protection
# CreatorProof

CreatorProof is a mini blockchain-based intellectual property protection system.

It allows creators to:

- Generate a unique SHA-256 fingerprint for a file
- Register the fingerprint on the deployed Sepolia contract using a connected wallet
- Publicly verify a file hash on Sepolia without connecting a wallet
- View the recorded work title, creator address, and blockchain timestamp

## Technologies

- HTML
- CSS
- JavaScript
- Solidity
- MetaMask
- Remix IDE
- Ethers.js

## Public file verification

Use the **Verify** section to select a file. CreatorProof calculates its SHA-256
fingerprint in the browser and queries the deployed contract through a
read-only Sepolia JSON-RPC provider. The file itself is not uploaded or stored
on-chain, and verification does not request a wallet connection.

The default RPC endpoint is the public endpoint
`https://ethereum-sepolia-rpc.publicnode.com`. To use a different Sepolia
endpoint, set `window.CREATORPROOF_SEPOLIA_RPC_URL` before loading `app.js`,
for example by adding this script in `index.html` immediately before the
`app.js` script tag:

```html
<script>
  window.CREATORPROOF_SEPOLIA_RPC_URL = "https://your-public-sepolia-rpc.example";
</script>
```

Use an HTTPS endpoint that does not contain a credential or API secret. Do not
put provider API keys or other secrets in browser code: visitors can inspect
them. If a provider requires an API key, proxy RPC requests through a
server-side service that keeps the key private.

## Run locally

Serve the project directory over localhost (for example, with the VS Code
Live Server extension) and open the page in a modern browser. A secure context
such as localhost or HTTPS is required for the browser's SHA-256 API.

To verify, select a previously registered file and choose **Verify on
Sepolia**. Repeat with a file that has not been registered to see the
no-matching-record result. These read-only checks do not require MetaMask.
Registration remains a separate wallet-signed transaction and is reported as
successful only after the transaction is confirmed on-chain.

Verification confirms only that identical file contents have a record in
this contract. It is not a determination of legal copyright ownership.

## Team Members

- Indusri CR
- Kumari Muskan Singh
- Priyanka
- Niharika
- Nayanathara
- Ganavi
- Shrusti
