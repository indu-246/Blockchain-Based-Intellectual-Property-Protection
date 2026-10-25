
/* =========================
   CREATORPROOF CONTRACT
========================= */

const CONTRACT_ADDRESS = "0xa8D8F47Ceb393195DAC1F651E59FCA3dDe23BBd7";
const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_RPC_URL =
    window.CREATORPROOF_SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";

const CONTRACT_ABI = [
    "function registerWork(bytes32 fileHash, string title)",
    "function registered(bytes32 fileHash) view returns (bool)",
    "function verifyWork(bytes32 fileHash) view returns (bool exists, string title, address creator, uint256 timestamp)"
];

/* =========================
   ELEMENTS
========================= */

const registrationForm =
    document.getElementById("registrationForm");

const connectWalletButton =
    document.getElementById("connectWalletButton");

const walletStatus =
    document.getElementById("walletStatus");

const walletProviderSelect =
    document.getElementById("walletProviderSelect");

const hashDisplay =
    document.getElementById("hashDisplay");

const successMessage =
    document.getElementById("successMessage");

const errorMessage =
    document.getElementById("errorMessage");

const registerButton =
    document.getElementById("registerButton");

const verificationForm =
    document.getElementById("verificationForm");

const verificationFile =
    document.getElementById("verificationFile");

const verificationHash =
    document.getElementById("verificationHash");

const verificationMessage =
    document.getElementById("verificationMessage");

const verifyButton =
    document.getElementById("verifyButton");

const verificationDetails =
    document.getElementById("verificationDetails");


/* =========================
   VARIABLES
========================= */

let connectedWallet = null;
let connectedWalletProvider = null;
let selectedWalletId = null;
const walletProviders = [];
const observedWalletProviders = new WeakSet();


/* =========================
   MESSAGE FUNCTIONS
========================= */

function showSuccess(message) {

    successMessage.textContent = message;

    errorMessage.textContent = "";
}


function showError(message) {

    errorMessage.textContent = message;

    successMessage.textContent = "";
}


/* =========================
   WALLET PROVIDER SELECTION
========================= */

function addWalletProvider(provider, info) {
    if (!provider || typeof provider.request !== "function") {
        return;
    }

    const rdns = (info && info.rdns || "").toLowerCase();
    const providerName = (info && info.name || "").toLowerCase();
    let name;
    if (provider.isRabby || rdns === "io.rabby" ||
        provider === window.rabby || providerName.includes("rabby")) {
        name = "Rabby Wallet";
    } else if (provider.isMetaMask || rdns === "io.metamask" ||
        providerName.includes("metamask")) {
        name = "MetaMask";
    } else {
        name = info && info.name || "Browser wallet";
    }

    if (walletProviders.some(entry => entry.provider === provider)) {
        return;
    }

    walletProviders.push({
        id: "wallet-" + walletProviders.length,
        name,
        provider
    });
    updateWalletProviderOptions();
}

function updateWalletProviderOptions() {
    walletProviderSelect.replaceChildren();

    if (walletProviders.length > 1) {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose a wallet";
        walletProviderSelect.appendChild(placeholder);
    }

    for (const entry of walletProviders) {
        const option = document.createElement("option");
        option.value = entry.id;
        option.textContent = entry.name;
        walletProviderSelect.appendChild(option);
    }

    walletProviderSelect.hidden = walletProviders.length < 2;
    if (walletProviders.length > 1 &&
        walletProviders.some(entry => entry.id === selectedWalletId)) {
        walletProviderSelect.value = selectedWalletId;
    } else if (walletProviders.length) {
        walletProviderSelect.value =
            walletProviders.length === 1 ? walletProviders[0].id : "";
    }
}

function discoverInjectedWallets() {
    const injected = window.ethereum;
    const providers = injected && Array.isArray(injected.providers)
        ? injected.providers
        : injected ? [injected] : [];

    providers.forEach(provider => addWalletProvider(provider));
    addWalletProvider(window.rabby, { name: "Rabby Wallet", rdns: "io.rabby" });
}

async function discoverWalletProviders() {
    discoverInjectedWallets();
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    await new Promise(resolve => setTimeout(resolve, 500));
    discoverInjectedWallets();
}

function getSelectedWalletProvider() {
    discoverInjectedWallets();

    if (!walletProviders.length) {
        return null;
    }

    if (walletProviders.length === 1) {
        return walletProviders[0];
    }

    if (selectedWalletId) {
        return walletProviders.find(
            entry => entry.id === selectedWalletId
        ) || null;
    }

    const injected = window.ethereum;
    const preferredWallet = walletProviders.find(entry =>
        entry.provider === window.rabby
    );
    const injectedWallet = walletProviders.find(entry =>
        entry.provider === injected ||
        (injected && Array.isArray(injected.providers) &&
            injected.providers.includes(entry.provider))
    );
    const selectedWallet = preferredWallet || injectedWallet || walletProviders[0];
    selectedWalletId = selectedWallet.id;
    walletProviderSelect.value = selectedWallet.id;
    return selectedWallet;
}

async function connectSelectedWallet() {
    await discoverWalletProviders();
    const selectedWallet = getSelectedWalletProvider();
    if (!selectedWallet) {
        throw new Error(
            "No EIP-1193 wallet provider was detected. Install or enable Rabby Wallet or MetaMask and reload this page."
        );
    }

    const accounts = await selectedWallet.provider.request({
        method: "eth_requestAccounts"
    });
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error(
            selectedWallet.name + " did not return an account. Unlock the wallet and try again."
        );
    }

    let chainId = await selectedWallet.provider.request({
        method: "eth_chainId"
    });
    if (BigInt(chainId) !== SEPOLIA_CHAIN_ID) {
        try {
            await selectedWallet.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0xaa36a7" }]
            });
        } catch (error) {
            const detail = error && (error.shortMessage || error.message);
            throw new Error(
                "Switch " + selectedWallet.name +
                " to Sepolia (Chain ID 11155111) to continue. " +
                (detail || "The wallet could not switch networks.")
            );
        }
        chainId = await selectedWallet.provider.request({
            method: "eth_chainId"
        });
    }
    if (BigInt(chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error(
            selectedWallet.name +
            " is not on Sepolia. Switch to Sepolia (Chain ID 11155111) and try again."
        );
    }

    showConnectedWallet(accounts, selectedWallet);
    observeWalletProvider(selectedWallet);

    return {
        selectedWallet,
        provider: new ethers.BrowserProvider(selectedWallet.provider)
    };
}

function showConnectedWallet(accounts, entry) {
    connectedWalletProvider = entry;

    if (!accounts.length) {
        connectedWallet = null;
        walletStatus.textContent = "Wallet not connected";
        connectWalletButton.textContent = "Connect Wallet";
        connectWalletButton.classList.remove("connected");
        return;
    }

    connectedWallet = accounts[0];
    const shortenedAddress =
        connectedWallet.substring(0, 6) +
        "..." +
        connectedWallet.substring(connectedWallet.length - 4);
    walletStatus.textContent = entry.name + ": " + shortenedAddress;
    connectWalletButton.textContent = "Wallet Connected";
    connectWalletButton.classList.add("connected");
}

function observeWalletProvider(entry) {
    if (observedWalletProviders.has(entry.provider)) {
        return;
    }
    observedWalletProviders.add(entry.provider);

    if (typeof entry.provider.on === "function") {
        entry.provider.on("accountsChanged", accounts => {
            if (connectedWalletProvider === entry) {
                showConnectedWallet(accounts, entry);
            }
        });
        entry.provider.on("chainChanged", chainId => {
            if (connectedWalletProvider === entry) {
                if (BigInt(chainId) !== SEPOLIA_CHAIN_ID) {
                    walletStatus.textContent =
                        "Switch " + entry.name + " to Sepolia";
                } else if (connectedWallet) {
                    const shortenedAddress =
                        connectedWallet.substring(0, 6) +
                        "..." +
                        connectedWallet.substring(connectedWallet.length - 4);
                    walletStatus.textContent =
                        entry.name + ": " + shortenedAddress;
                }
            }
        });
    }
}

window.addEventListener("eip6963:announceProvider", event => {
    const detail = event.detail;
    if (detail && detail.provider) {
        addWalletProvider(detail.provider, detail.info);
    }
});
discoverWalletProviders();

walletProviderSelect.addEventListener("change", function () {
    selectedWalletId = walletProviderSelect.value || null;
    connectedWallet = null;
    connectedWalletProvider = null;
    connectWalletButton.textContent = "Connect Wallet";
    connectWalletButton.classList.remove("connected");
    const selected = walletProviders.find(
        entry => entry.id === selectedWalletId
    );
    walletStatus.textContent = selected
        ? "Selected: " + selected.name
        : "Choose a wallet to continue";
});


/* =========================
   CONNECT SELECTED WALLET
========================= */

connectWalletButton.addEventListener(
    "click",
    async function () {

        showSuccess("");

        showError("");

        try {
            const { selectedWallet } = await connectSelectedWallet();
            showSuccess(selectedWallet.name + " connected on Sepolia.");
        }
        catch (error) {
            console.error(
                "Wallet connection error:",
                error
            );
            showError(registrationErrorMessage(error));
        }
    }
);

/* =========================
   SHA-256 FUNCTION
========================= */

async function generateSHA256(file) {

    if (!file || typeof file.arrayBuffer !== "function") {
        throw new Error("Please select a valid file.");
    }

    if (!globalThis.crypto || !globalThis.crypto.subtle) {
        throw new Error(
            "Secure browser hashing is unavailable. Open this page on HTTPS or localhost."
        );
    }

    /*
     * Convert the file into
     * an ArrayBuffer.
     */

    const fileBuffer =
        await file.arrayBuffer();


    /*
     * Generate SHA-256 digest.
     */

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            fileBuffer
        );


    /*
     * Convert the hash into
     * hexadecimal format.
     */

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );


    const hashHex =
        hashArray
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join("");


    return hashHex;
}

function clearVerificationResult() {
    verificationMessage.textContent = "";
    verificationMessage.dataset.state = "";
    verificationDetails.hidden = true;
    removeCertificate(verificationForm);
}

function removeCertificate(form) {
    const certificate = form.parentElement.querySelector(
        ".blockchain-certificate"
    );
    if (certificate) {
        certificate.remove();
    }
}

function showCertificate(form, details) {
    removeCertificate(form);

    const certificate = document.createElement("section");
    certificate.className = "blockchain-certificate";

    const heading = document.createElement("h3");
    heading.textContent = "Blockchain verification certificate";
    certificate.appendChild(heading);

    const rows = [
        ["Network", "Sepolia"],
        ["Work title", details.title],
        ["File SHA-256", details.fileHash],
        ["Creator wallet", details.creator],
        ["Blockchain timestamp", details.timestamp]
    ];
    if (details.transactionHash) {
        rows.push(["Confirmed transaction", details.transactionHash]);
    }
    if (details.blockNumber !== undefined) {
        rows.push(["Confirmed block", details.blockNumber.toString()]);
    }

    const list = document.createElement("dl");
    for (const [label, value] of rows) {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = value;
        row.append(term, description);
        list.appendChild(row);
    }
    certificate.appendChild(list);

    const disclaimer = document.createElement("p");
    disclaimer.textContent =
        "This certificate records a file-hash match on the specified contract. It is not proof of legal copyright ownership.";
    certificate.appendChild(disclaimer);

    form.parentElement.appendChild(certificate);
}

function registrationErrorMessage(error) {
    if (!error || typeof error !== "object") {
        return String(error || "Wallet connection failed.");
    }

    const message = [
        error.message,
        error.shortMessage,
        error.reason,
        error.data && error.data.message,
        error.info && error.info.error && error.info.error.message
    ].filter(Boolean).join(" ");

    if (/locked|unlock/i.test(message)) {
        return "Your wallet is locked. Unlock it and try again. " + message;
    }
    if (error.code === 4001) {
        return "Wallet request was declined. " + message;
    }
    if (error.code === -32002) {
        return "A wallet request is already pending. " + message;
    }
    if (error.code === 4100) {
        return "Wallet access was not authorized. " + message;
    }

    if (/insufficient funds/i.test(message)) {
        return "The connected wallet does not have enough Sepolia ETH to pay the registration gas fee. " + message;
    }
    if (/user rejected|request rejected/i.test(message)) {
        return "The wallet request was rejected. " + message;
    }
    if (/could not detect network|network changed|failed to fetch|timeout|disconnected/i.test(message)) {
        return "Could not reach the wallet's selected network. " + message;
    }
    return message ||
        "Registration failed. No successful registration was confirmed.";
}


/* =========================
   PUBLIC FILE VERIFICATION
========================= */

verificationForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        clearVerificationResult();
        verificationHash.textContent = "Checking file...";
        verificationHash.classList.remove("generated");

        const file = verificationFile.files[0];
        if (!file) {
            verificationHash.textContent = "Hash will appear after you select a file.";
            verificationMessage.textContent = "Please select a valid file to verify.";
            return;
        }

        verifyButton.disabled = true;
        verifyButton.textContent = "Generating fingerprint...";

        try {
            const hash = await generateSHA256(file);
            const fileHash = "0x" + hash;
            if (!ethers.isHexString(fileHash, 32)) {
                throw new Error("Could not generate a valid SHA-256 file fingerprint.");
            }

            verificationHash.textContent = fileHash;
            verificationHash.classList.add("generated");

            verifyButton.textContent = "Querying Sepolia...";
            const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
            const network = await provider.getNetwork();
            if (network.chainId !== SEPOLIA_CHAIN_ID) {
                throw new Error("The configured RPC endpoint is not connected to Sepolia.");
            }

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                provider
            );
            const isRegistered = await contract.registered(fileHash);

            if (!isRegistered) {
                verificationMessage.textContent =
                    "No matching registration was found on Sepolia for this file.";
                verificationMessage.dataset.state = "not-found";
                return;
            }

            const [exists, title, creator, timestamp] =
                await contract.verifyWork(fileHash);
            if (!exists) {
                verificationMessage.textContent =
                    "No matching registration was found on Sepolia for this file.";
                verificationMessage.dataset.state = "not-found";
                return;
            }

            document.getElementById("verifiedTitle").textContent = title;
            document.getElementById("verifiedCreator").textContent =
                ethers.getAddress(creator);
            document.getElementById("verifiedTimestamp").textContent =
                new Date(Number(timestamp) * 1000).toLocaleString() +
                " (Unix: " + timestamp.toString() + ")";
            verificationDetails.hidden = false;
            showCertificate(verificationForm, {
                title,
                fileHash,
                creator: ethers.getAddress(creator),
                timestamp: new Date(Number(timestamp) * 1000).toLocaleString() +
                    " (Unix: " + timestamp.toString() + ")"
            });
            verificationMessage.textContent =
                "A matching file hash is registered on Sepolia.";
            verificationMessage.dataset.state = "match";
        } catch (error) {
            console.error("File verification error:", error);
            verificationMessage.textContent =
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Verification failed. Check the RPC endpoint and try again.";
            verificationMessage.dataset.state = "error";
        } finally {
            verifyButton.disabled = false;
            verifyButton.textContent = "Verify on Sepolia";
        }
    }
);


verificationFile.addEventListener("change", function () {
    clearVerificationResult();
    verificationHash.textContent =
        verificationFile.files.length
            ? "Hash will be generated when you verify."
            : "Hash will appear after you select a file.";
    verificationHash.classList.remove("generated");
});


/* =========================
   FILE SELECTION
========================= */

const workFile =
    document.getElementById("workFile");


workFile.addEventListener(
    "change",
    function () {

        /*
         * Clear previous messages.
         */

        successMessage.textContent = "";

        errorMessage.textContent = "";
        removeCertificate(registrationForm);

        hashDisplay.textContent =
            "Hash will appear here after registration.";
        hashDisplay.classList.remove("generated");


        /*
         * Get selected file.
         */

        const file =
            workFile.files[0];


        if (!file) {

            hashDisplay.textContent =
                "Hash will appear here after registration.";

            hashDisplay.classList.remove(
                "generated"
            );

            return;
        }


        /*
         * Display selected filename.
         */

        console.log(
            "Selected file:",
            file.name
        );

    }
);


/* =========================
   REGISTRATION
========================= */

registrationForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        successMessage.textContent = "";
        errorMessage.textContent = "";
        removeCertificate(registrationForm);

        const creatorName = document.getElementById("creatorName").value.trim();
        const workTitle = document.getElementById("workTitle").value.trim();
        const workType = document.getElementById("workType").value;
        const creationDate = document.getElementById("creationDate").value;
        const description = document.getElementById("description").value.trim();
        const file = document.getElementById("workFile").files[0];

        if (!creatorName || !workTitle || !workType ||
            !creationDate || !description || !file ||
            typeof file.arrayBuffer !== "function") {
            showError("Please complete all fields and select a file.");
            return;
        }

        registerButton.disabled = true;
        try {
            registerButton.textContent = "Generating Fingerprint...";
            const hash = await generateSHA256(file);
            const fileHash = "0x" + hash;
            if (!ethers.isHexString(fileHash, 32)) {
                throw new Error("Could not generate a valid SHA-256 file fingerprint.");
            }
            hashDisplay.textContent = fileHash;
            hashDisplay.classList.add("generated");

            registerButton.textContent =
                "Connecting to wallet...";
            const { selectedWallet, provider } =
                await connectSelectedWallet();
            registerButton.textContent =
                "Connecting to " + selectedWallet.name + "...";

            const signer = await provider.getSigner();
            connectedWallet = await signer.getAddress();

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            // Prevent duplicate registration of the same file hash.
            registerButton.textContent = "Checking Blockchain...";
            const alreadyRegistered = await contract.registered(fileHash);

            if (alreadyRegistered) {
                showError("This exact file has already been registered on the blockchain.");
                return;
            }

            // Send the registration transaction.
            registerButton.textContent =
                "Confirm in " + selectedWallet.name + "...";
            const transaction = await contract.registerWork(
                fileHash,
                workTitle
            );

            showSuccess("Transaction submitted. Waiting for blockchain confirmation...");

            registerButton.textContent = "Waiting for Confirmation...";
            const receipt = await transaction.wait();

            if (!receipt || receipt.status !== 1) {
                throw new Error("The blockchain transaction failed.");
            }

            showSuccess(
                "Registration confirmed on Sepolia. Transaction: " +
                transaction.hash
            );

            let blockTimestamp = "Unavailable";
            try {
                const block = await provider.getBlock(receipt.blockNumber);
                if (block) {
                    blockTimestamp = new Date(
                        Number(block.timestamp) * 1000
                    ).toLocaleString() + " (Unix: " + block.timestamp + ")";
                }
            } catch (timestampError) {
                console.error("Confirmed block timestamp lookup failed:", timestampError);
                blockTimestamp = "Unavailable (block lookup failed)";
            }

            showCertificate(registrationForm, {
                title: workTitle,
                fileHash,
                creator: connectedWallet,
                timestamp: blockTimestamp,
                transactionHash: transaction.hash,
                blockNumber: receipt.blockNumber
            });

            console.log("Creator:", creatorName);
            console.log("Work title:", workTitle);
            console.log("Work type:", workType);
            console.log("Creation date:", creationDate);
            console.log("Description:", description);
            console.log("File:", file.name);
            console.log("SHA-256:", hash);
            console.log("Wallet:", connectedWallet);
            console.log("Transaction:", transaction.hash);
            console.log("Block:", receipt.blockNumber);

        } catch (error) {
            console.error("Registration error:", error);

            showError(registrationErrorMessage(error));

        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Register Work";
        }
    }
);
