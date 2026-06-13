const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");
const searchInput = document.getElementById("searchInput");

// Login Check
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}

// Load Data
let products = JSON.parse(localStorage.getItem("products")) || [];
let totalSales = Number(localStorage.getItem("totalSales")) || 0;
let salesData = JSON.parse(localStorage.getItem("salesData")) || {};
let salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

// Generate ID
let id =
    products.length > 0
        ? Math.max(...products.map(p => Number(p.id))) + 1
        : 1;

// Save Data
function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("totalSales", totalSales);
    localStorage.setItem("salesData", JSON.stringify(salesData));
    localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
}

// Dashboard
function checkLowStockAlert() {

    const lowCount =
        products.filter(p => Number(p.stock) <= 5).length;

    const lowStockBox =
        document.getElementById("lowStock");

    if (!lowStockBox) return;

    lowStockBox.innerText = lowCount;

    lowStockBox.style.color = lowCount > 0 ? "red" : "black";
    lowStockBox.style.fontWeight = lowCount > 0 ? "bold" : "normal";
}

function updateDashboard() {

    document.getElementById("totalProducts").innerText =
        products.length;

    document.getElementById("totalSales").innerText =
        totalSales;

    document.getElementById("lowStock").innerText =
        products.filter(p => Number(p.stock) < 5).length;

    checkLowStockAlert();
}

// Add Product
productForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const file = document.getElementById("image").files[0];
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const price = Number(document.getElementById("price").value);
    const stock = Number(document.getElementById("stock").value);

    const product = {
        id: id++,
        image: "",
        name,
        category,
        price,
        stock
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            product.image = reader.result;

            products.push(product);
            saveData();
            refreshUI();
        };
        reader.readAsDataURL(file);
    } else {
        products.push(product);
        saveData();
        refreshUI();
    }

    productForm.reset();
});

// Display Products
function displayProducts(data) {

    productTable.innerHTML = "";

    data.forEach(product => {

        let stockDisplay =
            Number(product.stock) < 5
                ? `<span style="color:red;font-weight:bold;">${product.stock} (Low)</span>`
                : product.stock;

        productTable.innerHTML += `
        <tr>
            <td>${product.id}</td>

            <td>
                ${product.image
                    ? `<img src="${product.image}" width="60" height="60" style="border-radius:8px;">`
                    : "No Image"}
            </td>

            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>${stockDisplay}</td>

            <td>
                <button onclick="recordSale(${product.id})">Sale</button>
                <button onclick="increasePrice(${product.id})">+</button>
                <button onclick="decreasePrice(${product.id})">-</button>
                <button onclick="increaseStock(${product.id})">Stock+</button>
                
                <!-- ✅ DELETE BUTTON HERE -->
        <button class="delete-btn" onclick="deleteProduct(${product.id})">
            Delete
        </button>
            </td>
        </tr>
        `;
    });
}

// Stock
function increaseStock(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.stock += 1;
    saveData();
    refreshUI();
}

// Delete
function deleteProduct(id) {

    if (!confirm("Delete?")) return;

    products = products.filter(p => p.id !== id);
    saveData();
    refreshUI();
}

// Price
function increasePrice(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    product.price += 10;
    saveData();
    refreshUI();
}

function decreasePrice(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (product.price > 10) product.price -= 10;

    saveData();
    refreshUI();
}

// SALE MODAL
let currentSaleProductId = null;

function recordSale(id) {

    const product = products.find(p => p.id === id);
    if (!product) return;

    if (product.stock <= 0) {
        alert("Out of Stock");
        return;
    }

    currentSaleProductId = id;

    document.getElementById("saleModal").style.display = "flex";

    document.getElementById("saleDate").value =
        new Date().toISOString().split("T")[0];
}

function closeSaleModal() {
    document.getElementById("saleModal").style.display = "none";
}

// Confirm Sale
document.getElementById("confirmSaleBtn").addEventListener("click", function () {

    const customerName = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const address = document.getElementById("customerAddress").value;
    const date = document.getElementById("saleDate").value;

    if (!customerName || !phone || !address || !date) {
        alert("Fill all fields");
        return;
    }

    const product = products.find(p => p.id === currentSaleProductId);
    if (!product) return;

    product.stock -= 1;
    totalSales++;

    if (!salesData[product.name]) salesData[product.name] = 0;
    salesData[product.name]++;

    salesHistory.push({
        product: product.name,
        image: product.image,
        customerName,
        phone,
        address,
        date
    });

    saveData();

    refreshUI();

    document.getElementById("saleModal").style.display = "none";

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerAddress").value = "";
});

// Sales
function loadSales() {

    const salesTable = document.getElementById("salesTable");
    if (!salesTable) return;

    salesTable.innerHTML = "";

    salesHistory.forEach(sale => {

        salesTable.innerHTML += `
        <tr>
            <td>
                ${sale.image ? `<img src="${sale.image}" width="50">` : "No Image"}
            </td>
            <td>${sale.product}</td>
            <td>${sale.customerName}</td>
            <td>${sale.phone}</td>
            <td>${sale.address}</td>
            <td>${sale.date}</td>
        </tr>
        `;
    });
}

// Low Stock
function loadLowStock() {

    const table = document.getElementById("lowStockTable");
    if (!table) return;

    table.innerHTML = "";

    const low = products.filter(p => p.stock <= 5);

    low.forEach(p => {

        table.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.stock}</td>
        </tr>
        `;
    });
}

// Dashboard Products
function loadDashboardProducts() {

    const box = document.getElementById("dashboardProducts");
    if (!box) return;

    box.innerHTML = "";

    products.slice(-5).reverse().forEach(p => {

        box.innerHTML += `
        <tr>
            <td>${p.image ? `<img src="${p.image}" width="40">` : ""}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.stock}</td>
        </tr>
        `;
    });
}

// Refresh UI
function refreshUI() {
    displayProducts(products);
    updateDashboard();
    loadLowStock();
    loadDashboardProducts();
    loadSales();
}

// Search
searchInput.addEventListener("keyup", function () {

    const v = searchInput.value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(v) ||
        p.category.toLowerCase().includes(v)
    );

    displayProducts(filtered);
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
});

// MENU
function hideAll() {
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("productsSection").style.display = "none";
    document.getElementById("salesSection").style.display = "none";
    document.getElementById("lowStockSection").style.display = "none";
}

document.getElementById("dashboardMenu").onclick = () => {
    hideAll();
    document.getElementById("dashboardSection").style.display = "block";
};

document.getElementById("productsMenu").onclick = () => {
    hideAll();
    document.getElementById("productsSection").style.display = "block";
};

document.getElementById("salesMenu").onclick = () => {
    hideAll();
    document.getElementById("salesSection").style.display = "block";
    loadSales();
};

document.getElementById("lowStockMenu").onclick = () => {
    hideAll();
    document.getElementById("lowStockSection").style.display = "block";
};

// INIT
displayProducts(products);
updateDashboard();
loadLowStock();
loadDashboardProducts();
loadSales();