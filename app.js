const registrationForm =
    document.getElementById("registrationForm");

const statusMessage =
    document.getElementById("statusMessage");


registrationForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const creatorName =
        document.getElementById("creatorName").value.trim();

    const workTitle =
        document.getElementById("workTitle").value.trim();

    const workType =
        document.getElementById("workType").value;

    const creationDate =
        document.getElementById("creationDate").value;

    const description =
        document.getElementById("description").value.trim();

    const workFile =
        document.getElementById("workFile").files[0];


    if (
        !creatorName ||
        !workTitle ||
        !workType ||
        !creationDate ||
        !description ||
        !workFile
    ) {

        statusMessage.textContent =
            "Please complete all fields.";

        return;
    }


    console.log("Creator:", creatorName);
    console.log("Work Title:", workTitle);
    console.log("Work Type:", workType);
    console.log("Creation Date:", creationDate);
    console.log("Description:", description);
    console.log("File:", workFile.name);


    statusMessage.textContent =
        "Work details captured successfully. Ready for fingerprint generation.";

});
