const API_BASE = "https://vendoros-ai-backend.onrender.com";

const userData = localStorage.getItem("vendoros_user");
const userId = localStorage.getItem("user_id");


// ===============================
// PROTECT DASHBOARD
// ===============================

if (!userData || !userId) {

    window.location.href = "login.html";

} else {

    try {

        const user = JSON.parse(userData);

        const userName = user.name || "User";
        const userRole = user.role || "Retailer";


        // User name
        const userNameElement =
            document.getElementById("userName");

        if (userNameElement) {
            userNameElement.textContent = userName;
        }


        // Welcome name
        const welcomeNameElement =
            document.getElementById("welcomeName");

        if (welcomeNameElement) {
            welcomeNameElement.textContent = userName;
        }


        // User role
        const userRoleElement =
            document.getElementById("userRole");

        if (userRoleElement) {
            userRoleElement.textContent = userRole;
        }


        // Avatar
        const avatarElement =
            document.getElementById("userAvatar");

        if (avatarElement) {

            const avatar =
                userName
                    .trim()
                    .charAt(0)
                    .toUpperCase();

            avatarElement.textContent = avatar;
        }

    } catch (error) {

        console.error("Invalid user data:", error);

        localStorage.clear();

        window.location.href = "login.html";
    }
}


// ===============================
// LOAD DASHBOARD DATA
// ===============================

async function loadDashboardData() {

    try {

        const salesResponse =
            await fetch(
                `${API_BASE}/sales/${userId}`
            );

        const productsResponse =
            await fetch(
                `${API_BASE}/products/${userId}`
            );

        const customersResponse =
            await fetch(
                `${API_BASE}/customers/${userId}`
            );


        if (!salesResponse.ok) {
            throw new Error("Sales API failed");
        }

        if (!productsResponse.ok) {
            throw new Error("Products API failed");
        }

        if (!customersResponse.ok) {
            throw new Error("Customers API failed");
        }


        const sales =
            await salesResponse.json();

        const products =
            await productsResponse.json();

        const customers =
            await customersResponse.json();


        updateStatistics(
            sales,
            products
        );

        updateSalesOverview(
            sales
        );

        updateAIInsights(
            sales,
            products,
            customers
        );

        updateRecentOrders(
            sales,
            products
        );

        updateAlerts(
            products
        );


    } catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );

    }
}


// ===============================
// STATISTICS
// ===============================

function updateStatistics(
    sales,
    products
) {

    let totalRevenue = 0;

    sales.forEach(function (sale) {

        totalRevenue +=
            Number(
                sale.total_amount || 0
            );
    });


    let lowStockCount = 0;


    products.forEach(function (product) {

        const quantity =
            Number(
                product.quantity || 0
            );

        const minimumStock =
            Number(
                product.minimum_stock || 0
            );


        if (
            quantity <= minimumStock
        ) {
            lowStockCount++;
        }
    });


    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (statCards.length >= 4) {

        // Total Revenue
        const revenueValue =
            statCards[0]
                .querySelector("h3");

        const revenueText =
            statCards[0]
                .querySelector(".neutral");

        if (revenueValue) {

            revenueValue.textContent =
                formatCurrency(
                    totalRevenue
                );
        }

        if (revenueText) {

            revenueText.textContent =
                sales.length > 0
                    ? `${sales.length} transaction(s) recorded`
                    : "No sales recorded yet";
        }


        // Total Products
        const productValue =
            statCards[1]
                .querySelector("h3");

        const productText =
            statCards[1]
                .querySelector(".neutral");

        if (productValue) {

            productValue.textContent =
                products.length;
        }

        if (productText) {

            productText.textContent =
                products.length > 0
                    ? "Products currently in inventory"
                    : "No products added yet";
        }


        // Total Orders
        const orderValue =
            statCards[2]
                .querySelector("h3");

        const orderText =
            statCards[2]
                .querySelector(".neutral");

        if (orderValue) {

            orderValue.textContent =
                sales.length;
        }

        if (orderText) {

            orderText.textContent =
                sales.length > 0
                    ? "Recorded sales transactions"
                    : "No orders recorded yet";
        }


        // Low Stock
        const lowStockValue =
            statCards[3]
                .querySelector("h3");

        const lowStockText =
            statCards[3]
                .querySelector(".neutral");

        if (lowStockValue) {

            lowStockValue.textContent =
                lowStockCount;
        }

        if (lowStockText) {

            if (lowStockCount === 0) {

                lowStockText.textContent =
                    "Inventory is healthy";

            } else {

                lowStockText.textContent =
                    "Items need attention";
            }
        }
    }
}


// ===============================
// SALES OVERVIEW
// ===============================

function updateSalesOverview(
    sales
) {

    const salesCard =
        document.querySelector(
            ".sales-card"
        );

    if (!salesCard) {
        return;
    }


    const emptyChart =
        salesCard.querySelector(
            ".empty-chart"
        );

    if (!emptyChart) {
        return;
    }


    if (sales.length === 0) {

        return;
    }


    let totalSales = 0;

    sales.forEach(function (sale) {

        totalSales +=
            Number(
                sale.total_amount || 0
            );
    });


    emptyChart.innerHTML = `

        <div class="empty-chart-icon">
            ↗
        </div>

        <h4>
            Sales activity detected
        </h4>

        <p>
            ${sales.length} transaction(s)
            recorded with total revenue of
            ${formatCurrency(totalSales)}.
        </p>

        <button
            class="secondary-button"
            type="button"
            onclick="window.location.href='sales.html'"
        >
            View Sales
        </button>

    `;
}


// ===============================
// AI INSIGHTS
// ===============================

function updateAIInsights(
    sales,
    products,
    customers
) {

    const aiEmpty =
        document.querySelector(
            ".ai-empty"
        );

    if (!aiEmpty) {
        return;
    }


    let lowStock = 0;
    let outOfStock = 0;


    products.forEach(function (product) {

        const quantity =
            Number(
                product.quantity || 0
            );

        const minimumStock =
            Number(
                product.minimum_stock || 0
            );


        if (quantity <= 0) {

            outOfStock++;

        } else if (
            quantity <= minimumStock
        ) {

            lowStock++;
        }
    });


    let message = "";


    if (products.length === 0) {

        message =
            "Add products to start receiving inventory insights.";

    } else if (outOfStock > 0) {

        message =
            `${outOfStock} product(s) are currently out of stock. Review inventory immediately.`;

    } else if (lowStock > 0) {

        message =
            `${lowStock} product(s) are approaching their minimum stock level.`;

    } else if (sales.length > 0) {

        message =
            `${sales.length} sales transaction(s) recorded. Your business activity is being tracked.`;

    } else {

        message =
            "Your store is ready. Record sales to generate business insights.";
    }


    aiEmpty.innerHTML = `

        <h4>
            ${message}
        </h4>

        <p>
            ${products.length} product(s),
            ${customers.length} customer(s),
            and ${sales.length} sale(s)
            are currently available for analysis.
        </p>

        <button
            class="secondary-button"
            type="button"
            onclick="window.location.href='ai-insights.html'"
        >
            View AI Insights
        </button>

    `;
}


// ===============================
// RECENT ORDERS
// ===============================

function updateRecentOrders(
    sales,
    products
) {

    const ordersCard =
        document.querySelector(
            ".orders-card"
        );

    if (!ordersCard) {
        return;
    }


    const emptyState =
        ordersCard.querySelector(
            ".empty-state"
        );

    if (!emptyState) {
        return;
    }


    if (sales.length === 0) {

        return;
    }


    const productNames = {};


    products.forEach(function (product) {

        productNames[product.id] =
            product.product_name;
    });


    const recentSales =
        sales.slice(-5).reverse();


    let html = "";


    recentSales.forEach(function (sale) {

        const productName =
            productNames[sale.product_id] ||
            "Product";


        html += `

            <div style="
                padding: 12px 0;
                border-bottom: 1px solid #eef2f7;
            ">

                <strong style="
                    display: block;
                    font-size: 13px;
                    color: #1e293b;
                    margin-bottom: 4px;
                ">
                    ${escapeHtml(productName)}
                </strong>

                <span style="
                    font-size: 12px;
                    color: #64748b;
                ">
                    ${Number(sale.quantity || 0)}
                    unit(s)
                    ·
                    ${formatCurrency(
                        Number(
                            sale.total_amount || 0
                        )
                    )}
                </span>

            </div>

        `;
    });


    emptyState.innerHTML = html;
}


// ===============================
// ALERTS
// ===============================

function updateAlerts(
    products
) {

    const alertsCard =
        document.querySelector(
            ".alerts-card"
        );

    if (!alertsCard) {
        return;
    }


    const emptyState =
        alertsCard.querySelector(
            ".empty-state"
        );

    if (!emptyState) {
        return;
    }


    const alerts = [];


    products.forEach(function (product) {

        const quantity =
            Number(
                product.quantity || 0
            );

        const minimumStock =
            Number(
                product.minimum_stock || 0
            );


        if (quantity <= 0) {

            alerts.push(
                `${product.product_name} is out of stock.`
            );

        } else if (
            quantity <= minimumStock
        ) {

            alerts.push(
                `${product.product_name} is low on stock.`
            );
        }
    });


    if (alerts.length === 0) {

        emptyState.innerHTML = `

            <div class="empty-icon">
                ✓
            </div>

            <h4>
                No alerts
            </h4>

            <p>
                Your current inventory has no
                critical stock alerts.
            </p>

        `;

        return;
    }


    let html = "";


    alerts.slice(0, 5).forEach(
        function (alert) {

            html += `

                <div style="
                    padding: 12px 0;
                    border-bottom: 1px solid #eef2f7;
                    font-size: 13px;
                    color: #475569;
                ">
                    ⚠ ${escapeHtml(alert)}
                </div>

            `;
        }
    );


    emptyState.innerHTML = html;
}


// ===============================
// CURRENCY
// ===============================

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount);
}


// ===============================
// HTML ESCAPE
// ===============================

function escapeHtml(
    value
) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// LOGOUT
// ===============================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "vendoros_user"
            );

            localStorage.removeItem(
                "user_id"
            );

            localStorage.removeItem(
                "user_role"
            );

            window.location.href =
                "login.html";
        }
    );
}


// ===============================
// START DASHBOARD
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboardData();

    }
);