async function loadInventory() {

    const userData = localStorage.getItem("vendoros_user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    const tableBody = document.getElementById("inventoryTableBody");
    const message = document.getElementById("inventoryMessage");
    const searchBox = document.getElementById("searchBox");

    let products = [];

    try {

        message.textContent = "Loading inventory...";
        message.className = "loading-state";

        const response = await fetch(
            `http://127.0.0.1:8000/products/${user.user_id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to load inventory."
            );
        }

        products = data;

        renderProducts(products);

        searchBox.addEventListener("input", () => {

            const searchTerm =
                searchBox.value.trim().toLowerCase();

            const filteredProducts = products.filter(product =>
                product.product_name
                    .toLowerCase()
                    .includes(searchTerm)
                ||
                product.category
                    .toLowerCase()
                    .includes(searchTerm)
                ||
                (product.sku || "")
                    .toLowerCase()
                    .includes(searchTerm)
            );

            renderProducts(filteredProducts);

        });

    } catch (error) {

        console.error("Inventory error:", error);

        tableBody.innerHTML = "";

        message.textContent =
            error.message || "Unable to load inventory.";

        message.className = "error-state";
    }


    function renderProducts(productList) {

        tableBody.innerHTML = "";

        if (productList.length === 0) {

            message.textContent =
                "No products added yet.";

            message.className = "empty-state";

            return;
        }

        message.textContent = "";


        productList.forEach(product => {

            const row = document.createElement("tr");

            let stockClass = "stock-good";
            let stockText = "In Stock";

            if (product.quantity === 0) {

                stockClass = "stock-out";
                stockText = "Out of Stock";

            } else if (
                product.quantity <= product.minimum_stock
            ) {

                stockClass = "stock-low";
                stockText = "Low Stock";
            }


            row.innerHTML = `

                <td>
                    <span class="product-name">
                        ${product.product_name}
                    </span>
                </td>

                <td>
                    <span class="category-badge">
                        ${product.category}
                    </span>
                </td>

                <td>
                    ${product.sku || "-"}
                </td>

                <td>
                    ₹${Number(product.purchase_price).toFixed(2)}
                </td>

                <td>
                    ₹${Number(product.selling_price).toFixed(2)}
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>
                    <span class="stock-badge ${stockClass}">
                        ${stockText}
                    </span>
                </td>

                <td>
                    ${product.expiry_date || "-"}
                </td>

            `;

            tableBody.appendChild(row);

        });
    }
}


loadInventory();