const API_BASE = "https://vendoros-ai-backend.onrender.com";

const userId = localStorage.getItem("user_id");

if (!userId) {
    window.location.href = "login.html";
}


/* ================================
   LOAD DATA
================================ */

async function loadAIInsights() {
    try {
        const salesResponse = await fetch(
            `${API_BASE}/sales/${userId}`
        );

        const productsResponse = await fetch(
            `${API_BASE}/products/${userId}`
        );

        const customersResponse = await fetch(
            `${API_BASE}/customers/${userId}`
        );

        if (!salesResponse.ok) {
            throw new Error("Failed to load sales");
        }

        if (!productsResponse.ok) {
            throw new Error("Failed to load products");
        }

        if (!customersResponse.ok) {
            throw new Error("Failed to load customers");
        }

        const sales = await salesResponse.json();
        const products = await productsResponse.json();
        const customers = await customersResponse.json();

        updateMetrics(sales, products, customers);
        createSalesChart(sales);
        createProductsChart(sales, products);
        createInventoryChart(products);
        updateInsights(sales, products, customers);

    } catch (error) {
        console.error("AI Insights Error:", error);
    }
}


/* ================================
   METRICS
================================ */

function updateMetrics(sales, products, customers) {

    let totalSales = 0;

    sales.forEach(function (sale) {
        totalSales += Number(sale.total_amount || 0);
    });

    const totalSalesElement =
        document.getElementById("totalSales");

    if (totalSalesElement) {
        totalSalesElement.textContent =
            formatCurrency(totalSales);
    }


    const customerElement =
        document.getElementById("customerCount");

    if (customerElement) {
        customerElement.textContent =
            customers.length;
    }


    let healthyProducts = 0;

    products.forEach(function (product) {

        const quantity =
            Number(product.quantity || 0);

        const minimumStock =
            Number(product.minimum_stock || 0);

        if (quantity > minimumStock) {
            healthyProducts++;
        }
    });


    let healthPercentage = 0;

    if (products.length > 0) {
        healthPercentage =
            Math.round(
                (healthyProducts / products.length) * 100
            );
    }


    const inventoryElement =
        document.getElementById("inventoryHealth");

    if (inventoryElement) {
        inventoryElement.textContent =
            healthPercentage + "%";
    }


    const growthElement =
        document.getElementById("salesGrowth");

    if (growthElement) {
        growthElement.textContent = "—";
    }
}


/* ================================
   SALES TREND
================================ */

function createSalesChart(sales) {

    const canvas =
        document.getElementById("salesTrendChart");

    if (!canvas) {
        return;
    }


    const dailySales = {};

    const today = new Date();


    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
            today.getDate() - i
        );

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        const key =
            year + "-" + month + "-" + day;

        dailySales[key] = 0;
    }


    sales.forEach(function (sale) {

        if (!sale.created_at) {
            return;
        }

        const date =
            new Date(sale.created_at);

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1).padStart(2, "0");

        const day =
            String(date.getDate()).padStart(2, "0");

        const key =
            year + "-" + month + "-" + day;


        if (dailySales[key] !== undefined) {

            dailySales[key] +=
                Number(sale.total_amount || 0);
        }
    });


    const keys =
        Object.keys(dailySales);

    const labels = [];
    const values = [];


    keys.forEach(function (key) {

        const parts =
            key.split("-");

        const date =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );

        labels.push(
            date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
            })
        );

        values.push(
            dailySales[key]
        );
    });


    new Chart(canvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Sales",

                data: values,

                borderColor: "#2563eb",

                backgroundColor:
                    "rgba(37, 99, 235, 0.10)",

                borderWidth: 3,

                fill: true,

                tension: 0.4
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


/* ================================
   TOP PRODUCTS
================================ */

function createProductsChart(sales, products) {

    const canvas =
        document.getElementById("topProductsChart");

    if (!canvas) {
        return;
    }


    const productNames = {};
    const productQuantities = {};


    products.forEach(function (product) {

        productNames[product.id] =
            product.product_name;

        productQuantities[product.id] = 0;
    });


    sales.forEach(function (sale) {

        const productId =
            sale.product_id;

        if (productQuantities[productId] === undefined) {
            productQuantities[productId] = 0;
        }

        productQuantities[productId] +=
            Number(sale.quantity || 0);
    });


    const productList = [];


    Object.keys(productQuantities).forEach(
        function (productId) {

            productList.push({
                name:
                    productNames[productId] ||
                    "Product " + productId,

                quantity:
                    productQuantities[productId]
            });
        }
    );


    productList.sort(function (a, b) {
        return b.quantity - a.quantity;
    });


    const topProducts =
        productList.slice(0, 5);


    const labels =
        topProducts.map(function (product) {
            return product.name;
        });


    const values =
        topProducts.map(function (product) {
            return product.quantity;
        });


    new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Units Sold",

                data: values,

                backgroundColor: "#3b82f6",

                borderRadius: 7
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


/* ================================
   INVENTORY HEALTH
================================ */

function createInventoryChart(products) {

    const canvas =
        document.getElementById("inventoryHealthChart");

    if (!canvas) {
        return;
    }


    let healthy = 0;
    let lowStock = 0;
    let outOfStock = 0;


    products.forEach(function (product) {

        const quantity =
            Number(product.quantity || 0);

        const minimumStock =
            Number(product.minimum_stock || 0);


        if (quantity <= 0) {

            outOfStock++;

        } else if (quantity <= minimumStock) {

            lowStock++;

        } else {

            healthy++;
        }
    });


    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Healthy Stock",
                "Low Stock",
                "Out of Stock"
            ],

            datasets: [{

                data: [
                    healthy,
                    lowStock,
                    outOfStock
                ],

                backgroundColor: [
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444"
                ],

                borderWidth: 0
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "68%",

            plugins: {

                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


/* ================================
   BUSINESS INSIGHTS
================================ */

function updateInsights(sales, products, customers) {

    const salesInsight =
        document.getElementById("salesInsight");

    if (salesInsight) {

        if (sales.length === 0) {

            salesInsight.textContent =
                "No sales have been recorded yet.";

        } else {

            salesInsight.textContent =
                sales.length +
                " sales transaction(s) are currently recorded.";
        }
    }


    let lowStock = 0;
    let outOfStock = 0;


    products.forEach(function (product) {

        const quantity =
            Number(product.quantity || 0);

        const minimumStock =
            Number(product.minimum_stock || 0);


        if (quantity <= 0) {

            outOfStock++;

        } else if (quantity <= minimumStock) {

            lowStock++;
        }
    });


    const inventoryInsight =
        document.getElementById("inventoryInsight");

    if (inventoryInsight) {

        inventoryInsight.textContent =
            lowStock +
            " product(s) are low on stock and " +
            outOfStock +
            " product(s) are out of stock.";
    }


    const customerInsight =
        document.getElementById("customerInsight");

    if (customerInsight) {

        customerInsight.textContent =
            customers.length +
            " customer(s) are currently registered.";
    }
}


/* ================================
   CURRENCY
================================ */

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 0

    }).format(amount);
}


/* ================================
   START
================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadAIInsights();
    }
);