
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
   CONNECT METAMASK WALLET
========================= */

connectWalletButton.addEventListener(
    "click",
    async function () {

        showSuccess("");

        showError("");

        /*
         * Check whether MetaMask
         * or another Ethereum wallet exists.
         */

        if (!window.ethereum) {

            showError(
                "MetaMask is not installed. Please install MetaMask to connect your wallet."
            );

            return;
        }


        try {

            /*
             * Request wallet accounts.
             */

            const accounts =
                await window.ethereum.request({
                    method: "eth_requestAccounts"
                });


            if (accounts.length === 0) {

                showError(
                    "No wallet account was found."
                );

                return;
            }


            connectedWallet = accounts[0];


            /*
             * Display shortened wallet address.
             */

            const shortenedAddress =
                connectedWallet.substring(0, 6) +
                "..." +
                connectedWallet.substring(
                    connectedWallet.length - 4
                );


            walletStatus.textContent =
                "Connected: " +
                shortenedAddress;


            connectWalletButton.textContent =
                "Wallet Connected";


            connectWalletButton.classList.add(
                "connected"
            );


            showSuccess(
                "Wallet connected successfully."
            );


            console.log(
                "Connected wallet:",
                connectedWallet
            );

        }

        catch (error) {

            console.error(
                "Wallet connection error:",
                error
            );


            showError(
                "Wallet connection was cancelled or failed."
            );

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

        const creatorName = document.getElementById("creatorName").value.trim();
        const workTitle = document.getElementById("workTitle").value.trim();
        const workType = document.getElementById("workType").value;
        const creationDate = document.getElementById("creationDate").value;
        const description = document.getElementById("description").value.trim();
        const file = document.getElementById("workFile").files[0];

        if (!creatorName || !workTitle || !workType ||
            !creationDate || !description || !file) {
            showError("Please complete all fields and select a file.");
            return;
        }

        if (!window.ethereum) {
            showError("Please install or open MetaMask.");
            return;
        }

        try {
            registerButton.disabled = true;
            registerButton.textContent = "Connecting to Sepolia...";

            // Connect to the wallet and contract.
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            const network = await provider.getNetwork();

            if (network.chainId !== SEPOLIA_CHAIN_ID) {
                showError("Please switch MetaMask to Sepolia Test Network.");
                return;
            }

            const signer = await provider.getSigner();
            connectedWallet = await signer.getAddress();

            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );

            // Generate the file's SHA-256 fingerprint.
            registerButton.textContent = "Generating Fingerprint...";
            const hash = await generateSHA256(file);
            const fileHash = "0x" + hash;

            hashDisplay.textContent = hash;
            hashDisplay.classList.add("generated");

            // Prevent duplicate registration of the same file hash.
            registerButton.textContent = "Checking Blockchain...";
            const alreadyRegistered = await contract.registered(fileHash);

            if (alreadyRegistered) {
                showError("This exact file has already been registered on the blockchain.");
                return;
            }

            // Send the registration transaction.
            registerButton.textContent = "Confirm in MetaMask...";
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
                "Work registered successfully on Sepolia! Transaction: " +
                transaction.hash
            );

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

            showError(
                error.reason ||
                error.shortMessage ||
                error.message ||
                "Registration failed. Please check MetaMask and try again."
            );

        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Register Work";
        }
    }
);



/* =========================
   METAMASK ACCOUNT CHANGE
========================= */

if (window.ethereum) {

    window.ethereum.on(
        "accountsChanged",
        function (accounts) {

            if (accounts.length === 0) {

                connectedWallet = null;

                walletStatus.textContent =
                    "Wallet not connected";

                connectWalletButton.textContent =
                    "Connect Wallet";

                connectWalletButton.classList.remove(
                    "connected"
                );

                return;
            }


            connectedWallet =
                accounts[0];


            const shortenedAddress =
                connectedWallet.substring(0, 6) +
                "..." +
                connectedWallet.substring(
                    connectedWallet.length - 4
                );


            walletStatus.textContent =
                "Connected: " +
                shortenedAddress;

        }
    );

}