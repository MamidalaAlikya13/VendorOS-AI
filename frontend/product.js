async function saveProduct(event) {
    event.preventDefault();

    const message = document.getElementById("productMessage");

    const userData = localStorage.getItem("vendoros_user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

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

    message.textContent = "Saving product...";
    message.style.color = "#64748b";

    try {
        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/products/${user.user_id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to save product.");
        }

        message.textContent = "Product saved successfully!";
        message.style.color = "#16a34a";

    } catch (error) {
        console.error(error);

        message.textContent =
            error.message || "Unable to connect to server.";

        message.style.color = "#dc2626";
    }
}