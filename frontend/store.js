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


async function loadStore() {

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/store/${user.user_id}`
        );

        if (response.status === 404) {
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to load store details."
            );
        }

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

    } catch (error) {

        console.error(error);

        storeMessage.textContent =
            "Unable to load store details.";

        storeMessage.style.color = "#dc2626";
    }
}


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


    if (!storeName || !businessType) {

        storeMessage.textContent =
            "Please enter your store name and business type.";

        storeMessage.style.color = "#dc2626";

        return;
    }


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

        // Check whether this retailer already has a store
        const checkResponse = await fetch(
            `http://127.0.0.1:8000/store/${user.user_id}`
        );


        let response;


        if (checkResponse.ok) {

            // Existing store → UPDATE
            response = await fetch(
                `http://127.0.0.1:8000/store/${user.user_id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(storeData)
                }
            );

        } else if (checkResponse.status === 404) {

            // No store → CREATE
            response = await fetch(
                `http://127.0.0.1:8000/store/${user.user_id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(storeData)
                }
            );

        } else {

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


        storeMessage.textContent =
            data.message || "Store saved successfully!";

        storeMessage.style.color = "#16a34a";


        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 800);


    } catch (error) {

        console.error(error);

        storeMessage.textContent =
            error.message || "Unable to connect to the server.";

        storeMessage.style.color = "#dc2626";
    }

});


// Load existing store details when the page opens
loadStore();