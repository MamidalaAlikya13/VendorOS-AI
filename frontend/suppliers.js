const API_BASE = "https://vendoros-ai-backend.onrender.com";

const ownerId = localStorage.getItem("user_id");

let suppliers = [];



// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    if (!ownerId) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadSuppliers();

    const searchInput =
        document.getElementById("searchSupplier");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterSuppliers
        );

    }

});



// ===============================
// LOAD SUPPLIERS
// ===============================

async function loadSuppliers() {

    try {

        const response = await fetch(
            `${API_BASE}/suppliers/${ownerId}`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load suppliers"
            );

        }

        suppliers = await response.json();

        renderSuppliers(suppliers);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "supplierTableContainer"
        ).innerHTML = `

            <div class="empty">

                Unable to load suppliers.

            </div>

        `;

    }

}



// ===============================
// RENDER SUPPLIERS
// ===============================

function renderSuppliers(list) {

    const container =
        document.getElementById(
            "supplierTableContainer"
        );

    updateSummary(list);


    if (!list.length) {

        container.innerHTML = `

            <div class="empty">

                No suppliers found.

            </div>

        `;

        return;

    }


    let rows = "";


    list.forEach((supplier) => {

        rows += `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(supplier.name)}
                    </strong>

                </td>


                <td class="company">

                    ${escapeHTML(
                        supplier.company || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        supplier.phone || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        supplier.email || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        supplier.address || "-"
                    )}

                </td>

            </tr>

        `;

    });


    container.innerHTML = `

        <table>

            <thead>

                <tr>

                    <th>Supplier</th>

                    <th>Company</th>

                    <th>Phone</th>

                    <th>Email</th>

                    <th>Address</th>

                </tr>

            </thead>


            <tbody>

                ${rows}

            </tbody>

        </table>

    `;

}



// ===============================
// SUMMARY
// ===============================

function updateSummary(list) {

    document.getElementById(
        "totalSuppliers"
    ).textContent = list.length;


    const companies = new Set(

        list

            .map(
                supplier => supplier.company
            )

            .filter(
                company =>
                    company &&
                    company.trim() !== ""
            )

    );


    document.getElementById(
        "totalCompanies"
    ).textContent = companies.size;


    const contacts = list.filter(
        supplier =>
            supplier.phone ||
            supplier.email
    );


    document.getElementById(
        "activeContacts"
    ).textContent = contacts.length;

}



// ===============================
// SEARCH
// ===============================

function filterSuppliers() {

    const searchValue =
        document
            .getElementById("searchSupplier")
            .value
            .trim()
            .toLowerCase();


    const filtered =
        suppliers.filter((supplier) => {

            return (

                (supplier.name || "")
                    .toLowerCase()
                    .includes(searchValue)

                ||

                (supplier.company || "")
                    .toLowerCase()
                    .includes(searchValue)

                ||

                (supplier.phone || "")
                    .toLowerCase()
                    .includes(searchValue)

                ||

                (supplier.email || "")
                    .toLowerCase()
                    .includes(searchValue)

            );

        });


    renderSuppliers(filtered);

}



// ===============================
// SUPPLIER MODAL
// ===============================

function openSupplierModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (modal) {

        modal.remove();

    }


    const modalHTML = `

        <div
            id="supplierModal"
            style="
                position:fixed;
                inset:0;
                background:rgba(15,23,42,.55);
                display:flex;
                align-items:center;
                justify-content:center;
                z-index:9999;
                padding:20px;
            "
        >

            <div
                style="
                    width:100%;
                    max-width:520px;
                    background:white;
                    border-radius:18px;
                    padding:28px;
                    box-shadow:0 25px 60px rgba(0,0,0,.2);
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:22px;
                    "
                >

                    <div>

                        <h2 style="margin-bottom:5px;">

                            Add Supplier

                        </h2>


                        <p
                            style="
                                color:#64748b;
                                font-size:13px;
                            "
                        >

                            Add a supplier to your business directory

                        </p>

                    </div>


                    <button
                        onclick="closeSupplierModal()"
                        style="
                            border:none;
                            background:#f1f5f9;
                            width:34px;
                            height:34px;
                            border-radius:8px;
                            cursor:pointer;
                            font-size:18px;
                        "
                    >

                        ×

                    </button>

                </div>


                <form id="supplierForm">

                    <div style="margin-bottom:15px;">

                        <label
                            style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                margin-bottom:7px;
                            "
                        >

                            Supplier Name *

                        </label>


                        <input
                            type="text"
                            id="supplierName"
                            maxlength="150"
                            placeholder="Enter supplier name"
                            required
                            style="${inputStyle()}"
                        >


                        <small
                            id="supplierNameError"
                            style="${errorStyle()}"
                        ></small>

                    </div>


                    <div style="margin-bottom:15px;">

                        <label
                            style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                margin-bottom:7px;
                            "
                        >

                            Company

                        </label>


                        <input
                            type="text"
                            id="supplierCompany"
                            maxlength="150"
                            placeholder="Enter company name"
                            style="${inputStyle()}"
                        >

                    </div>


                    <div style="margin-bottom:15px;">

                        <label
                            style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                margin-bottom:7px;
                            "
                        >

                            Phone

                        </label>


                        <input
                            type="tel"
                            id="supplierPhone"
                            maxlength="10"
                            inputmode="numeric"
                            placeholder="10-digit phone number"
                            style="${inputStyle()}"
                        >


                        <small
                            id="supplierPhoneError"
                            style="${errorStyle()}"
                        ></small>

                    </div>


                    <div style="margin-bottom:15px;">

                        <label
                            style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                margin-bottom:7px;
                            "
                        >

                            Email

                        </label>


                        <input
                            type="email"
                            id="supplierEmail"
                            maxlength="150"
                            placeholder="Enter email address"
                            style="${inputStyle()}"
                        >


                        <small
                            id="supplierEmailError"
                            style="${errorStyle()}"
                        ></small>

                    </div>


                    <div style="margin-bottom:20px;">

                        <label
                            style="
                                display:block;
                                font-size:13px;
                                font-weight:600;
                                margin-bottom:7px;
                            "
                        >

                            Address

                        </label>


                        <textarea
                            id="supplierAddress"
                            maxlength="300"
                            rows="3"
                            placeholder="Enter supplier address"
                            style="${inputStyle()};resize:vertical;"
                        ></textarea>

                    </div>


                    <button
                        type="submit"
                        style="
                            width:100%;
                            background:#6366f1;
                            color:white;
                            border:none;
                            padding:13px;
                            border-radius:10px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >

                        Add Supplier

                    </button>

                </form>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        modalHTML
    );


    document
        .getElementById("supplierForm")
        .addEventListener(
            "submit",
            handleSupplierSubmit
        );


    // Phone: allow digits only

    document
        .getElementById("supplierPhone")
        .addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

            }
        );

}



// ===============================
// FORM VALIDATION + SUBMIT
// ===============================

async function handleSupplierSubmit(event) {

    event.preventDefault();

    clearErrors();


    const name =
        document
            .getElementById("supplierName")
            .value
            .trim();


    const company =
        document
            .getElementById("supplierCompany")
            .value
            .trim();


    const phone =
        document
            .getElementById("supplierPhone")
            .value
            .trim();


    const email =
        document
            .getElementById("supplierEmail")
            .value
            .trim();


    const address =
        document
            .getElementById("supplierAddress")
            .value
            .trim();


    let valid = true;



    // ===========================
    // NAME VALIDATION
    // ===========================

    if (!name) {

        showError(
            "supplierNameError",
            "Supplier name is required."
        );

        valid = false;

    } else if (name.length < 2) {

        showError(
            "supplierNameError",
            "Supplier name must contain at least 2 characters."
        );

        valid = false;

    } else if (name.length > 150) {

        showError(
            "supplierNameError",
            "Supplier name cannot exceed 150 characters."
        );

        valid = false;

    } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) {

        showError(
            "supplierNameError",
            "Supplier name can contain letters, spaces, dots, apostrophes and hyphens only."
        );

        valid = false;

    }



    // ===========================
    // PHONE VALIDATION
    // ===========================

    if (phone) {

        if (!/^[0-9]{10}$/.test(phone)) {

            showError(
                "supplierPhoneError",
                "Phone number must contain exactly 10 digits."
            );

            valid = false;

        } else if (!/^[6-9]/.test(phone)) {

            showError(
                "supplierPhoneError",
                "Enter a valid Indian mobile number."
            );

            valid = false;

        }

    }



    // ===========================
    // EMAIL VALIDATION
    // ===========================

    if (email) {

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


        if (!emailRegex.test(email)) {

            showError(
                "supplierEmailError",
                "Enter a valid email address."
            );

            valid = false;

        }

    }



    // ===========================
    // STOP IF INVALID
    // ===========================

    if (!valid) {

        return;

    }



    // ===========================
    // SEND TO BACKEND
    // ===========================

    const submitButton =
        event.target.querySelector(
            "button[type='submit']"
        );


    submitButton.disabled = true;

    submitButton.textContent =
        "Adding Supplier...";


    try {

        const response =
            await fetch(
                `${API_BASE}/suppliers/${ownerId}`,
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

                        company:
                            company || null,

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
                "Unable to create supplier."

            );

        }


        alert(
            "Supplier added successfully!"
        );


        closeSupplierModal();

        loadSuppliers();


    } catch (error) {

        console.error(error);

        alert(

            error.message ||
            "Something went wrong."

        );


    } finally {

        submitButton.disabled = false;

        submitButton.textContent =
            "Add Supplier";

    }

}



// ===============================
// ERROR HELPERS
// ===============================

function showError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            message;

    }

}


function clearErrors() {

    const errors = [

        "supplierNameError",

        "supplierPhoneError",

        "supplierEmailError"

    ];


    errors.forEach((id) => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent = "";

        }

    });

}



// ===============================
// CLOSE MODAL
// ===============================

function closeSupplierModal() {

    const modal =
        document.getElementById(
            "supplierModal"
        );


    if (modal) {

        modal.remove();

    }

}



// ===============================
// LOGOUT
// ===============================

function logoutUser() {

    localStorage.clear();

    window.location.href =
        "login.html";

}



// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



// ===============================
// STYLE HELPERS
// ===============================

function inputStyle() {

    return `

        width:100%;

        padding:11px 12px;

        border:1px solid #dbe1ea;

        border-radius:9px;

        outline:none;

        font-size:14px;

    `;

}


function errorStyle() {

    return `

        display:block;

        color:#dc2626;

        font-size:12px;

        margin-top:5px;

    `;

}



// ===============================
// MAKE INLINE FUNCTIONS AVAILABLE
// ===============================

window.openSupplierModal =
    openSupplierModal;

window.closeSupplierModal =
    closeSupplierModal;

window.logoutUser =
    logoutUser;