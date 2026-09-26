const salesUserData = localStorage.getItem("vendoros_user");

if (!salesUserData) {
    window.location.href = "login.html";
}

const salesUser = JSON.parse(salesUserData);

const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");
const customerNameInput = document.getElementById("customerName");

const productInfo = document.getElementById("productInfo");
const productPrice = document.getElementById("productPrice");
const productStock = document.getElementById("productStock");

const saleForm = document.getElementById("saleForm");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const billCustomer = document.getElementById("billCustomer");

const summaryItems = document.getElementById("summaryItems");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

const checkoutBtn = document.getElementById("checkoutBtn");
const saleMessage = document.getElementById("saleMessage");

const receipt = document.getElementById("receipt");
const receiptDetails = document.getElementById("receiptDetails");

const userPill = document.getElementById("userPill");


let products = [];
let cart = [];


/* USER */

if (salesUser.name) {
    userPill.textContent = salesUser.name;
}


/* LOAD PRODUCTS */

async function loadProducts() {

    try {

        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/products/${salesUser.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to load products."
            );
        }

        products = data;

        productSelect.innerHTML = `
            <option value="">
                Choose a product
            </option>
        `;

        products.forEach(product => {

            const option = document.createElement("option");

            option.value = product.id;

            option.textContent =
                `${product.product_name} — ₹${Number(product.selling_price).toFixed(2)} — ${product.quantity} in stock`;

            productSelect.appendChild(option);

        });

    } catch (error) {

        console.error(error);

        saleMessage.textContent =
            error.message || "Unable to load products.";

        saleMessage.className = "error";
    }
}


/* PRODUCT SELECTION */

productSelect.addEventListener(
    "change",
    function () {

        const productId =
            Number(productSelect.value);

        const product =
            products.find(
                item => item.id === productId
            );


        if (!product) {

            productInfo.classList.remove("visible");

            return;
        }


        productInfo.classList.add("visible");

        productPrice.textContent =
            `₹${Number(product.selling_price).toFixed(2)}`;

        productStock.textContent =
            product.quantity;

        quantityInput.value = 1;

    }
);


/* ADD TO CART */

saleForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const productId =
            Number(productSelect.value);

        const quantity =
            Number(quantityInput.value);

        const customerName =
            customerNameInput.value.trim();


        if (!productId) {

            showMessage(
                "Please select a product.",
                "error"
            );

            return;
        }


        if (!quantity || quantity <= 0) {

            showMessage(
                "Enter a valid quantity.",
                "error"
            );

            return;
        }


        const product =
            products.find(
                item => item.id === productId
            );


        if (!product) {

            showMessage(
                "Product not found.",
                "error"
            );

            return;
        }


        const existingItem =
            cart.find(
                item => item.product_id === productId
            );


        const newQuantity =
            existingItem
                ? existingItem.quantity + quantity
                : quantity;


        if (newQuantity > product.quantity) {

            showMessage(
                `Only ${product.quantity} units are available.`,
                "error"
            );

            return;
        }


        if (existingItem) {

            existingItem.quantity =
                newQuantity;

        } else {

            cart.push({

                product_id: product.id,

                product_name:
                    product.product_name,

                unit_price:
                    Number(product.selling_price),

                quantity:
                    quantity

            });

        }


        if (customerName) {
            billCustomer.value =
                customerName;
        }


        renderCart();

        productSelect.value = "";

        quantityInput.value = 1;

        customerNameInput.value = "";

        productInfo.classList.remove("visible");

        showMessage(
            "Product added to bill.",
            "success"
        );

    }
);


/* RENDER CART */

function renderCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <div class="empty-icon">
                    🛒
                </div>

                <div>
                    Your bill is empty
                </div>

                <div style="margin-top:5px;">
                    Add products to start a sale
                </div>

            </div>
        `;

        checkoutBtn.disabled = true;

        updateSummary();

        return;
    }


    cartItems.innerHTML = "";


    cart.forEach((item, index) => {

        const itemTotal =
            item.unit_price * item.quantity;


        const itemElement =
            document.createElement("div");

        itemElement.className =
            "cart-item";


        itemElement.innerHTML = `

            <div class="cart-item-top">

                <div>

                    <div class="cart-product">
                        ${item.product_name}
                    </div>

                    <div class="cart-meta">
                        ${item.quantity} × ₹${item.unit_price.toFixed(2)}
                    </div>

                </div>

                <div class="cart-price">
                    ₹${itemTotal.toFixed(2)}
                </div>

            </div>

            <button
                class="remove-btn"
                onclick="removeFromCart(${index})"
            >
                Remove
            </button>
        `;


        cartItems.appendChild(itemElement);

    });


    checkoutBtn.disabled = false;

    updateSummary();
}


/* REMOVE ITEM */

function removeFromCart(index) {

    cart.splice(index, 1);

    renderCart();

    showMessage(
        "Item removed from bill.",
        "success"
    );
}


/* SUMMARY */

function updateSummary() {

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                (item.unit_price * item.quantity),
            0
        );


    cartCount.textContent =
        `${totalItems} ${totalItems === 1 ? "item" : "items"}`;

    summaryItems.textContent =
        totalItems;

    summarySubtotal.textContent =
        `₹${subtotal.toFixed(2)}`;

    summaryTotal.textContent =
        `₹${subtotal.toFixed(2)}`;
}


/* COMPLETE SALE */

checkoutBtn.addEventListener(
    "click",
    async function () {

        if (cart.length === 0) {
            return;
        }


        checkoutBtn.disabled = true;

        showMessage(
            "Processing sale...",
            ""
        );


        const customerName =
            billCustomer.value.trim() || null;


        const completedSales = [];


        try {

            for (const item of cart) {

                const response =
                    await fetch(
                        `https://vendoros-ai-backend.onrender.com/sales/${salesUser.user_id}`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                product_id:
                                    item.product_id,

                                quantity:
                                    item.quantity,

                                customer_name:
                                    customerName

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Unable to complete sale."
                    );
                }


                completedSales.push(data);

            }


            showReceipt(
                completedSales,
                customerName
            );


            cart = [];

            billCustomer.value = "";

            renderCart();


            await loadProducts();


            showMessage(
                "Sale completed successfully.",
                "success"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to complete sale.",
                "error"
            );

        } finally {

            checkoutBtn.disabled =
                cart.length === 0;

        }

    }
);


/* RECEIPT */

function showReceipt(
    completedSales,
    customerName
) {

    const total =
        completedSales.reduce(
            (sum, sale) =>
                sum + Number(sale.total_amount),
            0
        );


    const now =
        new Date().toLocaleString();


    receiptDetails.innerHTML = `

        <div class="receipt-line">
            <span>Customer</span>
            <strong>
                ${customerName || "Walk-in Customer"}
            </strong>
        </div>

        <div class="receipt-line">
            <span>Date</span>
            <strong>${now}</strong>
        </div>

        ${completedSales.map(sale => `

            <div class="receipt-line">
                <span>
                    ${sale.product_name}
                    × ${sale.quantity}
                </span>

                <strong>
                    ₹${Number(
                        sale.total_amount
                    ).toFixed(2)}
                </strong>
            </div>

        `).join("")}

        <div class="receipt-total">

            <span>Total Paid</span>

            <span>
                ₹${total.toFixed(2)}
            </span>

        </div>

    `;


    receipt.classList.add("show");

    receipt.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* MESSAGE */

function showMessage(
    message,
    type
) {

    saleMessage.textContent =
        message;

    saleMessage.className =
        type;
}


/* LOGOUT */

function logoutUser() {

    localStorage.removeItem(
        "vendoros_user"
    );

    window.location.href =
        "login.html";
}


/* INITIAL LOAD */

loadProducts();