# 🔐 CreatorProof — Blockchain-Based Intellectual Property Protection

CreatorProof is a blockchain-based mini project designed to help creators establish verifiable proof of registration for their digital work. It uses cryptographic hashing and blockchain technology to record file fingerprints and verify existing registrations.

## 📌 Project Overview

Digital creators need a way to demonstrate that a particular digital file was registered at a specific time. CreatorProof addresses this by generating a unique SHA-256 fingerprint for a file and registering that fingerprint on the Ethereum Sepolia test blockchain.

The original file remains on the user's device; the application registers its fingerprint and associated metadata on the blockchain.

## ✨ Features

- **SHA-256 Fingerprinting:** Generates a cryptographic fingerprint for uploaded files.
- **Blockchain Registration:** Records a file fingerprint and title through a Solidity smart contract.
- **File Verification:** Checks whether a file's fingerprint has already been registered.
- **Creator Verification:** Retrieves the creator wallet address associated with a registration.
- **Duplicate Prevention:** Prevents registering an identical file fingerprint more than once.
- **Registration Certificate:** Displays registration information after a successful blockchain transaction.
- **Public Verification:** Allows users to verify registrations without connecting a wallet.
- **Responsive Interface:** Provides a simple interface for registering and verifying digital work.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Solidity
- Ethers.js v6
- Ethereum Sepolia Testnet
- Remix IDE
- Rabby Wallet / MetaMask-compatible wallets

## 🏗️ System Architecture

1. **File Upload:** The creator selects a digital file.
2. **Fingerprint Generation:** JavaScript generates a SHA-256 hash locally in the browser.
3. **Wallet Connection:** The creator connects a compatible Ethereum wallet.
4. **Blockchain Registration:** The smart contract stores the file fingerprint, title, creator address, and timestamp.
5. **Verification:** The application hashes the selected file and checks the blockchain for a matching registration.
6. **Certificate Display:** When a registration is found, the application displays its associated information.

## 📜 Smart Contract

- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** `11155111`
- **Contract Address:** `0xa8D8F47Ceb393195DAC1F651E59FCA3dDe23BBd7`

[View the contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xa8D8F47Ceb393195DAC1F651E59FCA3dDe23BBd7)

## 🚀 Running the Project Locally

### Prerequisites

- Google Chrome or another supported browser
- Visual Studio Code
- Live Server extension
- A compatible Ethereum wallet for registration
- Sepolia test ETH for blockchain transaction fees

### Steps

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Start `index.html` using the Live Server extension.
4. Open the website in your browser.
5. Navigate to **Register** to register a file or **Verify** to check an existing registration.
6. For registration, connect a compatible wallet configured for Sepolia and approve the transaction after reviewing its details.

Public verification should work without connecting a wallet.

## 🧪 Testing Results

The following tests were performed during development:

| Test | Result |
|---|---|
| Navigation between website pages | Passed |
| Required-field validation | Passed |
| SHA-256 fingerprint generation | Passed |
| Blockchain registration on Sepolia | Passed |
| Verification of a registered file | Passed |
| Detection of an unregistered file | Passed |
| Duplicate registration prevention | Passed |
| Registration certificate display | Passed |

## ⚠️ Limitations

- The project currently uses the Sepolia testnet, not Ethereum Mainnet.
- Test ETH has no real monetary value.
- A matching hash demonstrates that a file matches a recorded registration; it does not independently establish legal copyright ownership.
- The system relies on the integrity of the deployed smart contract and the correctness of the application's verification process.
- The original uploaded file is not stored on the blockchain.

## 👥 Team Members

- Indusri CR
- Kumari Muskan Singh
- Priyanka
- Niharika
- Nayanathara
- Ganavi
- Shrusti

## 🎯 Project Objective

To demonstrate how blockchain technology and cryptographic hashing can provide a transparent, tamper-evident record of digital work registration and support verification of previously registered files.
