async function loadInventory() {

    const userData = localStorage.getItem("vendoros_user");

    if (!userData) {
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    const tableBody =
        document.getElementById("inventoryTableBody");

    const message =
        document.getElementById("inventoryMessage");

    const searchBox =
        document.getElementById("searchBox");

    let products = [];

    try {

        message.textContent =
            "Loading inventory...";

        message.className =
            "loading-state";


        const response = await fetch(
            `https://vendoros-ai-backend.onrender.com/products/${user.user_id}`
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load inventory."
            );
        }


        products = data;


        addActionsHeader();

        renderProducts(products);


        searchBox.addEventListener(
            "input",
            () => {

                const searchTerm =
                    searchBox.value
                        .trim()
                        .toLowerCase();


                const filteredProducts =
                    products.filter(product =>

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


                renderProducts(
                    filteredProducts
                );

            }
        );


    } catch (error) {

        console.error(
            "Inventory error:",
            error
        );


        tableBody.innerHTML = "";


        message.textContent =
            error.message ||
            "Unable to load inventory.";


        message.className =
            "error-state";
    }


    function addActionsHeader() {

        const headerRow =
            document.querySelector(
                ".inventory-table thead tr"
            );


        if (!headerRow) {
            return;
        }


        const alreadyExists =
            Array.from(
                headerRow.children
            ).some(
                th =>
                    th.dataset.actionsColumn ===
                    "true"
            );


        if (!alreadyExists) {

            const th =
                document.createElement("th");

            th.textContent =
                "Actions";

            th.dataset.actionsColumn =
                "true";

            headerRow.appendChild(th);
        }
    }


    function renderProducts(productList) {

        tableBody.innerHTML = "";


        if (productList.length === 0) {

            message.textContent =
                "No products added yet.";

            message.className =
                "empty-state";

            return;
        }


        message.textContent = "";


        productList.forEach(product => {

            const row =
                document.createElement("tr");


            let stockClass =
                "stock-good";

            let stockText =
                "In Stock";


            if (product.quantity === 0) {

                stockClass =
                    "stock-out";

                stockText =
                    "Out of Stock";


            } else if (
                product.quantity <=
                product.minimum_stock
            ) {

                stockClass =
                    "stock-low";

                stockText =
                    "Low Stock";
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
                    ₹${Number(
                        product.purchase_price
                    ).toFixed(2)}
                </td>

                <td>
                    ₹${Number(
                        product.selling_price
                    ).toFixed(2)}
                </td>

                <td>
                    ${product.quantity}
                </td>

                <td>
                    <span
                        class="stock-badge ${stockClass}"
                    >
                        ${stockText}
                    </span>
                </td>

                <td>
                    ${product.expiry_date || "-"}
                </td>

                <td>

                    <div
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            type="button"
                            onclick="editProduct(${product.id})"
                            style="
                                border:1px solid #dbe1ea;
                                background:#fff;
                                color:#2563eb;
                                padding:7px 10px;
                                border-radius:7px;
                                cursor:pointer;
                                font-size:11px;
                                font-weight:600;
                            "
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            onclick="removeProduct(${product.id})"
                            style="
                                border:1px solid #fecaca;
                                background:#fff;
                                color:#dc2626;
                                padding:7px 10px;
                                border-radius:7px;
                                cursor:pointer;
                                font-size:11px;
                                font-weight:600;
                            "
                        >
                            Remove
                        </button>

                    </div>

                </td>
            `;


            tableBody.appendChild(row);

        });
    }
}


async function editProduct(productId) {

    const userData =
        localStorage.getItem(
            "vendoros_user"
        );


    if (!userData) {

        window.location.href =
            "login.html";

        return;
    }


    const user =
        JSON.parse(userData);


    try {

        const response =
            await fetch(
                `https://vendoros-ai-backend.onrender.com/products/${user.user_id}`
            );


        const products =
            await response.json();


        if (!response.ok) {

            throw new Error(
                products.detail ||
                "Unable to load product."
            );
        }


        const product =
            products.find(
                item =>
                    item.id === productId
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;
        }


        localStorage.setItem(
            "vendoros_edit_product",
            JSON.stringify(product)
        );


        window.location.href =
            "product.html?edit=true";


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Unable to open product."
        );
    }
}


async function removeProduct(productId) {

    const confirmed =
        confirm(
            "Are you sure you want to remove this product?"
        );


    if (!confirmed) {
        return;
    }


    const userData =
        localStorage.getItem(
            "vendoros_user"
        );


    if (!userData) {

        window.location.href =
            "login.html";

        return;
    }


    const user =
        JSON.parse(userData);


    try {

        const response =
            await fetch(
                `https://vendoros-ai-backend.onrender.com/products/${user.user_id}/${productId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to remove product."
            );
        }


        alert(
            "Product removed successfully."
        );


        loadInventory();


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Unable to remove product."
        );
    }
}


loadInventory();