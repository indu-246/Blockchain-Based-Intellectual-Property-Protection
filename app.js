const workFile = document.getElementById("workFile");
const registrationForm = document.getElementById("registrationForm");
const statusMessage = document.getElementById("statusMessage");

// Generate SHA-256 fingerprint
async function generateSHA256(file) {
    const fileBuffer = await file.arrayBuffer();

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        fileBuffer
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return hashHex;
}

// Handle form submission
registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const file = workFile.files[0];

    if (!file) {
        statusMessage.textContent = "Please select a file first.";
        return;
    }

    try {
        const fileHash = await generateSHA256(file);

        statusMessage.innerHTML = `
            <strong>SHA-256 Fingerprint:</strong>
            <br>
            <code>${fileHash}</code>
        `;

        console.log("File:", file.name);
        console.log("SHA-256:", fileHash);

    } catch (error) {
        console.error("SHA-256 generation failed:", error);

        statusMessage.textContent =
            "Error generating SHA-256 fingerprint.";
    }
});
