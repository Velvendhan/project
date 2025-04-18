// Sample transaction data
let transactions = [
    { id: 1, type: 'income', amount: 2500, category: 'salary', date: '2023-05-01', description: 'Monthly Salary' },
    { id: 2, type: 'expense', amount: 150, category: 'food', date: '2023-05-02', description: 'Grocery Shopping' },
    { id: 3, type: 'expense', amount: 75, category: 'transportation', date: '2023-05-03', description: 'Gas' },
    { id: 4, type: 'expense', amount: 200, category: 'housing', date: '2023-05-05', description: 'Electric Bill' },
    { id: 5, type: 'income', amount: 500, category: 'freelance', date: '2023-05-10', description: 'Freelance Work' }
];

// DOM Elements
const transactionsList = document.getElementById('transactions-list');
const transactionModal = document.getElementById('transactionModal');
const transactionForm = document.getElementById('transactionForm');
const addTransactionBtn = document.querySelector('.btn-add');
const closeModalBtn = document.querySelector('.close-btn');

// Initialize Charts
let spendingChart, budgetChart;

// Functions
function renderTransactions() {
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || 'No description'}</td>
            <td>${formatCategory(transaction.category)}</td>
            <td class="${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
            <td>
                <button class="action-btn edit-btn" data-id="${transaction.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${transaction.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        transactionsList.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editTransaction(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteTransaction(e.target.dataset.id));
    });

    updateCharts();
    updateSummaryCards();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function updateSummaryCards() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = totalIncome - totalExpenses;
    const totalBalance = 12000 + savings; // Starting balance + net
    
    document.querySelector('.balance-card .amount').textContent = `$${totalBalance.toFixed(2)}`;
    document.querySelector('.income-card .amount').textContent = `$${totalIncome.toFixed(2)}`;
    document.querySelector('.expense-card .amount').textContent = `$${totalExpenses.toFixed(2)}`;
    document.querySelector('.savings-card .amount').textContent = `$${savings.toFixed(2)}`;
}

function updateCharts() {
    // Spending by category chart
    const spendingCtx = document.getElementById('spendingChart').getContext('2d');
    
    // Group expenses by category
    const expensesByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expensesByCategory[t.category]) {
                expensesByCategory[t.category] = 0;
            }
            expensesByCategory[t.category] += t.amount;
        });
    
    if (spendingChart) {
        spendingChart.destroy();
    }
    
    spendingChart = new Chart(spendingCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(expensesByCategory).map(formatCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
    
    // Budget vs actual chart
    const budgetCtx = document.getElementById('budgetChart').getContext('2d');
    
    // Sample budget data (in a real app, this would come from a database)
    const budgetData = {
        food: 400,
        transportation: 200,
        housing: 1000,
        entertainment: 300
    };
    
    const actualData = {
        food: expensesByCategory.food || 0,
        transportation: expensesByCategory.transportation || 0,
        housing: expensesByCategory.housing || 0,
        entertainment: expensesByCategory.entertainment || 0
    };
    
    if (budgetChart) {
        budgetChart.destroy();
    }
    
    budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(budgetData).map(formatCategory),
            datasets: [
                {
                    label: 'Budget',
                    data: Object.values(budgetData),
                    backgroundColor: '#3498db'
                },
                {
                    label: 'Actual',
                    data: Object.values(actualData),
                    backgroundColor: '#2ecc71'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    beginAtZero: true
                }
            }
        }
    });
}

function addTransaction(e) {
    e.preventDefault();
    
    const newTransaction = {
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        date: document.getElementById('transactionDate').value,
        description: document.getElementById('transactionDescription').value
    };
    
    transactions.push(newTransaction);
    renderTransactions();
    closeModal();
    transactionForm.reset();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === parseInt(id));
    if (!transaction) return;
    
    document.getElementById('transactionType').value = transaction.type;
    document.getElementById('transactionAmount').value = transaction.amount;
    document.getElementById('transactionCategory').value = transaction.category;
    document.getElementById('transactionDate').value = transaction.date;
    document.getElementById('transactionDescription').value = transaction.description || '';
    
    openModal();
    
    // Update form to handle edit
    transactionForm.onsubmit = function(e) {
        e.preventDefault();
        
        transaction.type = document.getElementById('transactionType').value;
        transaction.amount = parseFloat(document.getElementById('transactionAmount').value);
        transaction.category = document.getElementById('transactionCategory').value;
        transaction.date = document.getElementById('transactionDate').value;
        transaction.description = document.getElementById('transactionDescription').value;
        
        renderTransactions();
        closeModal();
        transactionForm.reset();
        
        // Reset form handler back to add
        transactionForm.onsubmit = addTransaction;
    };
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== parseInt(id));
        renderTransactions();
    }
}

function openModal() {
    transactionModal.style.display = 'flex';
    document.getElementById('transactionDate').valueAsDate = new Date();
}

function closeModal() {
    transactionModal.style.display = 'none';
}

// Event Listeners
addTransactionBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
transactionForm.addEventListener('submit', addTransaction);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === transactionModal) {
        closeModal();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
});