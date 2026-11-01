
const form = document.getElementById("transaction-form");

const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transaction-list");
const chartCanvas = document.getElementById("expenseChart");

let transactions = [];

try {
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];
} catch (error) {
    transactions = [];
}

// Add Transaction
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Please enter valid details");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        category: category,
        amount: amount,
        type: type
    };

    transactions.push(transaction);

    saveData();
    displayTransactions();

    form.reset();
});

// Display Transactions
function displayTransactions() {
    transactionList.innerHTML = "";

    transactions.forEach(function (item) {
        const li = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = item.description;

        const category = document.createElement("span");
        category.textContent = item.category || "Other";

        const amount = document.createElement("span");

        amount.textContent =
            (item.type === "income" ? "+" : "-") +
            "₹" + Number(item.amount).toFixed(2);

        amount.style.color =
            item.type === "income" ? "green" : "red";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {
            transactions = transactions.filter(function (transaction) {
                return transaction.id !== item.id;
            });

            saveData();
            displayTransactions();
        });

        li.append(name, category, amount, deleteButton);
        transactionList.appendChild(li);
    });

    calculateTotals();
}

// Calculate Income, Expense and Balance
function calculateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(function (item) {
        if (item.type === "income") {
            totalIncome += Number(item.amount);
        } else if (item.type === "expense") {
            totalExpense += Number(item.amount);
        }
    });

    const balance = totalIncome - totalExpense;

    balanceElement.textContent = "₹" + balance.toFixed(2);
    incomeElement.textContent = "₹" + totalIncome.toFixed(2);
    expenseElement.textContent = "₹" + totalExpense.toFixed(2);

    drawChart(totalIncome, totalExpense);
}

// Draw Income and Expense Chart
function drawChart(income, expense) {
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext("2d");

    const width = chartCanvas.clientWidth;
    const height = 260;
    const pixelRatio = window.devicePixelRatio || 1;

    chartCanvas.width = width * pixelRatio;
    chartCanvas.height = height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(income, expense, 1000);

    const chartTop = 25;
    const chartBottom = 195;
    const chartHeight = chartBottom - chartTop;

    ctx.beginPath();
    ctx.moveTo(20, chartBottom);
    ctx.lineTo(width - 20, chartBottom);
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();

    const barWidth = Math.min(90, width / 5);

    const incomeX = width * 0.30 - barWidth / 2;
    const expenseX = width * 0.70 - barWidth / 2;

    const incomeHeight = (income / maxValue) * chartHeight;
    const expenseHeight = (expense / maxValue) * chartHeight;

    ctx.fillStyle = "#16a34a";
    ctx.fillRect(
        incomeX,
        chartBottom - incomeHeight,
        barWidth,
        incomeHeight
    );

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
        expenseX,
        chartBottom - expenseHeight,
        barWidth,
        expenseHeight
    );

    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle = "#16a34a";
    ctx.fillText(
        "₹" + income.toFixed(0),
        incomeX + barWidth / 2,
        Math.max(chartTop, chartBottom - incomeHeight - 10)
    );

    ctx.fillStyle = "#ef4444";
    ctx.fillText(
        "₹" + expense.toFixed(0),
        expenseX + barWidth / 2,
        Math.max(chartTop, chartBottom - expenseHeight - 10)
    );

    ctx.font = "14px Arial";
    ctx.fillStyle = "#475569";

    ctx.fillText("Income", incomeX + barWidth / 2, 225);
    ctx.fillText("Expense", expenseX + barWidth / 2, 225);
}

// Save Data
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Resize Chart
window.addEventListener("resize", function () {
    calculateTotals();
});

// Initial Load
displayTransactions();

