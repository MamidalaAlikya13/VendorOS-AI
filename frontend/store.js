const storeForm = document.getElementById("storeForm");
const storeMessage = document.getElementById("storeMessage");

const userData = localStorage.getItem("vendoros_user");

if (!userData) {
    window.location.href = "login.html";
}

let user;

try {
    user = JSON.parse(userData);
} catch (error) {
    localStorage.removeItem("vendoros_user");
    window.location.href = "login.html";
}


// --------------------------------------------------
// Load existing store details
// --------------------------------------------------

async function loadStore() {

    try {

        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/store/${user.user_id}`
        );

        // No store created yet
        if (response.status === 404) {

            // Show account owner if available
            document.getElementById("ownerName").value =
                user.name ||
                user.full_name ||
                user.username ||
                "";

            return;
        }

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Unable to load store details."
            );
        }


        // Fill store details
        document.getElementById("storeName").value =
            data.store_name || "";

        document.getElementById("businessType").value =
            data.business_type || "";

        document.getElementById("phone").value =
            data.phone || "";

        document.getElementById("email").value =
            data.email || "";

        document.getElementById("address").value =
            data.address || "";


        // Fill account owner
        document.getElementById("ownerName").value =
            user.name ||
            user.full_name ||
            user.username ||
            data.owner_name ||
            "";


    } catch (error) {

        console.error("Load store error:", error);

        storeMessage.textContent =
            "Unable to load store details.";

        storeMessage.style.color = "#dc2626";
    }
}


// --------------------------------------------------
// Save / Update Store
// --------------------------------------------------

storeForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const storeName =
        document.getElementById("storeName").value.trim();

    const businessType =
        document.getElementById("businessType").value;

    const phone =
        document.getElementById("phone").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const address =
        document.getElementById("address").value.trim();


    // Validation
    if (!storeName || !businessType) {

        storeMessage.textContent =
            "Please enter your store name and business type.";

        storeMessage.style.color = "#dc2626";

        return;
    }


    // Show saving message
    storeMessage.textContent =
        "Saving your store details...";

    storeMessage.style.color = "#64748b";


    const storeData = {

        store_name: storeName,

        business_type: businessType,

        phone: phone || null,

        email: email || null,

        address: address || null

    };


    try {

        // --------------------------------------------------
        // Check whether store already exists
        // --------------------------------------------------

        const checkResponse = await fetch(
            `https://vendoros-ai-backend.onrender.com/store/${user.user_id}`
        );


        let response;


        // --------------------------------------------------
        // Existing store → UPDATE
        // --------------------------------------------------

        if (checkResponse.ok) {

            response = await fetch(
                `https://vendoros-ai-backend.onrender.com/store/${user.user_id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(storeData)
                }
            );

        }

        // --------------------------------------------------
        // Store doesn't exist → CREATE
        // --------------------------------------------------

        else if (checkResponse.status === 404) {

            response = await fetch(
                `https://vendoros-ai-backend.onrender.com/store/${user.user_id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(storeData)
                }
            );

        }

        else {

            throw new Error(
                "Unable to check existing store."
            );
        }


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Unable to save store."
            );
        }


        // --------------------------------------------------
        // Success
        // --------------------------------------------------

        storeMessage.textContent =
            data.message || "Store saved successfully!";

        storeMessage.style.color = "#16a34a";


        // Return to dashboard
        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);


    } catch (error) {

        console.error("Save store error:", error);

        storeMessage.textContent =
            error.message ||
            "Unable to connect to the server.";

        storeMessage.style.color = "#dc2626";
    }

});


// --------------------------------------------------
// Load store when page opens
// --------------------------------------------------

loadStore();