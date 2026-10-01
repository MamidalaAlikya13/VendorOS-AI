async function saveProduct(event) {
    event.preventDefault();

    const message = document.getElementById("productMessage");

    const userData = localStorage.getItem("vendoros_user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    const editProduct = JSON.parse(
        localStorage.getItem("vendoros_edit_product") || "null"
    );

    const productData = {
        product_name: document.getElementById("productName").value.trim(),
        category: document.getElementById("category").value,
        sku: document.getElementById("sku").value.trim() || null,
        purchase_price: Number(document.getElementById("purchasePrice").value),
        selling_price: Number(document.getElementById("sellingPrice").value),
        quantity: Number(document.getElementById("quantity").value),
        minimum_stock: Number(document.getElementById("minimumStock").value),
        expiry_date: document.getElementById("expiryDate").value || null
    };

    const isEditMode = !!editProduct;

    const url = isEditMode
        ? `https://vendoros-ai-backend.onrender.com/products/${user.user_id}/${editProduct.id}`
        : `https://vendoros-ai-backend.onrender.com/products/${user.user_id}`;

    message.textContent = isEditMode
        ? "Updating product..."
        : "Saving product...";

    message.style.color = "#64748b";

    try {

        const response = await fetch(url, {
            method: isEditMode ? "PUT" : "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                (
                    isEditMode
                        ? "Unable to update product."
                        : "Unable to save product."
                )
            );
        }

        // EDIT SUCCESS
        if (isEditMode) {

            localStorage.removeItem("vendoros_edit_product");

            message.textContent =
                "Product updated successfully!";

            message.style.color = "#16a34a";

            setTimeout(() => {
                window.location.href = "inventory.html";
            }, 1200);

            return;
        }

        // ADD SUCCESS
        message.innerHTML = `
            <div style="margin-bottom:12px;">
                Product saved successfully!
            </div>

            <button
                type="button"
                onclick="addAnotherProduct()"
                style="
                    background:#2563eb;
                    color:white;
                    border:none;
                    padding:10px 16px;
                    border-radius:8px;
                    font-size:12px;
                    font-weight:600;
                    cursor:pointer;
                "
            >
                + Add Another Product
            </button>
        `;

        message.style.color = "#16a34a";

        window.productRedirectTimer = setTimeout(() => {
            window.location.href = "inventory.html";
        }, 5000);

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to connect to server.";

        message.style.color = "#dc2626";
    }
}


function addAnotherProduct() {

    if (window.productRedirectTimer) {
        clearTimeout(window.productRedirectTimer);
    }

    localStorage.removeItem("vendoros_edit_product");

    const form = document.querySelector("form");

    if (form) {
        form.reset();
    }

    const message =
        document.getElementById("productMessage");

    if (message) {
        message.textContent = "";
        message.style.color = "";
    }

    window.history.replaceState(
        {},
        document.title,
        "product.html"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function setupEditMode() {

    const editProduct = JSON.parse(
        localStorage.getItem("vendoros_edit_product") || "null"
    );

    if (!editProduct) {
        return;
    }

    const productName =
        document.getElementById("productName");

    const category =
        document.getElementById("category");

    const sku =
        document.getElementById("sku");

    const purchasePrice =
        document.getElementById("purchasePrice");

    const sellingPrice =
        document.getElementById("sellingPrice");

    const quantity =
        document.getElementById("quantity");

    const minimumStock =
        document.getElementById("minimumStock");

    const expiryDate =
        document.getElementById("expiryDate");


    if (productName) {
        productName.value =
            editProduct.product_name || "";
    }

    if (category) {
        category.value =
            editProduct.category || "";
    }

    if (sku) {
        sku.value =
            editProduct.sku || "";
    }

    if (purchasePrice) {
        purchasePrice.value =
            editProduct.purchase_price ?? "";
    }

    if (sellingPrice) {
        sellingPrice.value =
            editProduct.selling_price ?? "";
    }

    if (quantity) {
        quantity.value =
            editProduct.quantity ?? "";
    }

    if (minimumStock) {
        minimumStock.value =
            editProduct.minimum_stock ?? "";
    }

    if (expiryDate) {
        expiryDate.value =
            editProduct.expiry_date || "";
    }


    const submitButton =
        document.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.textContent =
            "Update Product";
    }
}


document.addEventListener(
    "DOMContentLoaded",
    setupEditMode
);