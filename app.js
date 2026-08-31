function showCertificate(title, walletAddress, fileHash, timestamp) {
    document.getElementById("certificate").style.display = "block";

    document.getElementById("certificateTitle").textContent = title;
    document.getElementById("certificateWallet").textContent = walletAddress;
    document.getElementById("certificateHash").textContent = fileHash;
    document.getElementById("certificateTimestamp").textContent = timestamp;
}


