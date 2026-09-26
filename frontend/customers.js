const customerUserData = localStorage.getItem("vendoros_user");

if (!customerUserData) {

    window.location.href = "login.html";

}

const customerUser = JSON.parse(customerUserData);

const customerTableBody =
    document.getElementById("customerTableBody");

const customerMessage =
    document.getElementById("customerMessage");

const searchBox =
    document.getElementById("searchBox");

const totalCustomers =
    document.getElementById("totalCustomers");

const emailCustomers =
    document.getElementById("emailCustomers");

const phoneCustomers =
    document.getElementById("phoneCustomers");

const userPill =
    document.getElementById("userPill");

const customerModal =
    document.getElementById("customerModal");

const customerForm =
    document.getElementById("customerForm");

const formMessage =
    document.getElementById("formMessage");

let customers = [];



if (customerUser.name) {

    userPill.textContent = customerUser.name;

}



/* LOAD CUSTOMERS */

async function loadCustomers() {

    try {

        customerMessage.textContent =
            "Loading customers...";

        customerMessage.className =
            "loading-state";


        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/customers/${customerUser.user_id}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load customers."
            );

        }


        customers = data;

        updateSummary();

        renderCustomers(customers);


    } catch (error) {

        console.error(error);

        customerTableBody.innerHTML = "";

        customerMessage.textContent =
            error.message ||
            "Unable to load customers.";

        customerMessage.className =
            "error-state";

    }

}



/* SUMMARY */

function updateSummary() {

    totalCustomers.textContent =
        customers.length;


    emailCustomers.textContent =
        customers.filter(
            customer => customer.email
        ).length;


    phoneCustomers.textContent =
        customers.filter(
            customer => customer.phone
        ).length;

}



/* RENDER CUSTOMERS */

function renderCustomers(customerList) {

    customerTableBody.innerHTML = "";


    if (customerList.length === 0) {

        customerMessage.textContent =
            "No customers found.";

        customerMessage.className =
            "empty-state";

        return;

    }


    customerMessage.textContent = "";


    customerList.forEach(customer => {

        const row =
            document.createElement("tr");


        const firstLetter =
            customer.name
                ? customer.name.charAt(0).toUpperCase()
                : "C";


        row.innerHTML = `

            <td>

                <div class="customer-cell">

                    <div class="avatar">
                        ${firstLetter}
                    </div>

                    <div>

                        <div class="customer-name">
                            ${customer.name}
                        </div>

                        <div class="customer-id">
                            Customer #${customer.id}
                        </div>

                    </div>

                </div>

            </td>


            <td class="phone">
                ${customer.phone || "-"}
            </td>


            <td class="email">
                ${customer.email || "-"}
            </td>


            <td>
                ${customer.address || "-"}
            </td>

        `;


        customerTableBody.appendChild(row);

    });

}



/* SEARCH */

searchBox.addEventListener(
    "input",
    function () {

        const searchTerm =
            searchBox.value
                .trim()
                .toLowerCase();


        const filteredCustomers =
            customers.filter(customer =>

                (customer.name || "")
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                (customer.phone || "")
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                (customer.email || "")
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                (customer.address || "")
                    .toLowerCase()
                    .includes(searchTerm)

            );


        renderCustomers(filteredCustomers);

    }
);



/* MODAL */

function openCustomerModal() {

    customerForm.reset();

    formMessage.textContent = "";

    customerModal.classList.add("show");

    document
        .getElementById("customerName")
        .focus();

}


function closeCustomerModal() {

    customerModal.classList.remove("show");

}



/* ADD CUSTOMER */

customerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("customerName")
                .value
                .trim();


        const phone =
            document
                .getElementById("customerPhone")
                .value
                .trim();


        const email =
            document
                .getElementById("customerEmail")
                .value
                .trim();


        const address =
            document
                .getElementById("customerAddress")
                .value
                .trim();



        /* NAME VALIDATION */

        if (!name) {

            formMessage.textContent =
                "Customer name is required.";

            formMessage.style.color =
                "#dc2626";

            return;

        }



        /* PHONE VALIDATION */

        const phoneRegex =
            /^[0-9]{10}$/;


        if (phone && !phoneRegex.test(phone)) {

            formMessage.textContent =
                "Phone number must contain exactly 10 digits.";

            formMessage.style.color =
                "#dc2626";

            return;

        }



        /* EMAIL VALIDATION */

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


        if (email && !emailRegex.test(email)) {

            formMessage.textContent =
                "Please enter a valid email address.";

            formMessage.style.color =
                "#dc2626";

            return;

        }



        const saveButton =
            customerForm.querySelector(
                ".save-btn"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        formMessage.textContent =
            "Saving customer...";

        formMessage.style.color =
            "#64748b";



        try {

            const response =
                await fetch(
                    `https://vendoros-ai-backend.onrender.com/customers/${customerUser.user_id}`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            name: name,

                            phone:
                                phone || null,

                            email:
                                email || null,

                            address:
                                address || null

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.detail ||

                    data.message ||

                    "Unable to save customer."

                );

            }


            formMessage.textContent =
                "Customer added successfully.";

            formMessage.style.color =
                "#16a34a";


            await loadCustomers();


            setTimeout(() => {

                closeCustomerModal();

            }, 500);


        } catch (error) {

            console.error(error);

            formMessage.textContent =
                error.message ||
                "Unable to save customer.";

            formMessage.style.color =
                "#dc2626";

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Customer";

        }

    }
);



/* CLOSE MODAL WHEN CLICKING OUTSIDE */

customerModal.addEventListener(
    "click",
    function (event) {

        if (event.target === customerModal) {

            closeCustomerModal();

        }

    }
);



/* LOGOUT */

function logoutUser() {

    localStorage.removeItem(
        "vendoros_user"
    );

    window.location.href =
        "login.html";

}



/* INITIAL LOAD */

loadCustomers();