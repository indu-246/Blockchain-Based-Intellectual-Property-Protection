function showCertificate(title, walletAddress, fileHash, timestamp) {
    document.getElementById("certificate").style.display = "block";

    document.getElementById("certificateTitle").textContent = title;
    document.getElementById("certificateWallet").textContent = walletAddress;
    document.getElementById("certificateHash").textContent = fileHash;
    document.getElementById("certificateTimestamp").textContent = timestamp;
}

/* =========================
   ELEMENTS

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


/* =========================
   VARIABLES

let connectedWallet = null;


/* =========================
   MESSAGE FUNCTIONS

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

async function generateSHA256(file) {

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


/* =========================
   FILE SELECTION

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

registrationForm.addEventListener(
    "submit",
    async function (event) {

        /*
         * Prevent page refresh.
         */

        event.preventDefault();


        /*
         * Clear old messages.
         */

        successMessage.textContent = "";

        errorMessage.textContent = "";


        /*
         * Get form values.
         */

        const creatorName =
            document
                .getElementById("creatorName")
                .value
                .trim();


        const workTitle =
            document
                .getElementById("workTitle")
                .value
                .trim();


        const workType =
            document
                .getElementById("workType")
                .value;


        const creationDate =
            document
                .getElementById("creationDate")
                .value;


        const description =
            document
                .getElementById("description")
                .value
                .trim();


        const file =
            document
                .getElementById("workFile")
                .files[0];


        /* =========================
           VALIDATION
        ========================= */


        if (!creatorName) {

            showError(
                "Please enter the creator name."
            );

            return;
        }


        if (!workTitle) {

            showError(
                "Please enter the work title."
            );

            return;
        }


        if (!workType) {

            showError(
                "Please select the type of work."
            );

            return;
        }


        if (!creationDate) {

            showError(
                "Please select the creation date."
            );

            return;
        }


        if (!description) {

            showError(
                "Please enter a description of the work."
            );

            return;
        }


        if (!file) {

            showError(
                "Please select a file to register."
            );

            return;
        }


        /* =========================
           GENERATE SHA-256
        ========================= */

        try {

            registerButton.disabled = true;

            registerButton.textContent =
                "Generating Fingerprint...";


            /*
             * Generate file fingerprint.
             */

            const hash =
                await generateSHA256(file);


            /*
             * Display generated hash.
             */

            hashDisplay.textContent =
                hash;


            hashDisplay.classList.add(
                "generated"
            );


            /* =========================
               LOG DATA
            ========================= */

            console.log(
                "Creator:",
                creatorName
            );


            console.log(
                "Work Title:",
                workTitle
            );


            console.log(
                "Work Type:",
                workType
            );


            console.log(
                "Creation Date:",
                creationDate
            );


            console.log(
                "Description:",
                description
            );


            console.log(
                "File:",
                file.name
            );


            console.log(
                "SHA-256:",
                hash
            );


            console.log(
                "Wallet:",
                connectedWallet
            );


            /* =========================
               SUCCESS
            ========================= */


            showSuccess(
                "SHA-256 fingerprint generated successfully. Your work is ready for blockchain registration."
            );


        }

        catch (error) {

            console.error(
                "Hash generation error:",
                error
            );


            showError(
                "Unable to generate the SHA-256 fingerprint."
            );

        }

        finally {

            registerButton.disabled = false;

            registerButton.textContent =
                "Register Work";

        }

    }
);


/* =========================
   METAMASK ACCOUNT CHANGE

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
