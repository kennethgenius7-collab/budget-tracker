class BudgetTracker {
    constructor() {
        // DOM Elements
        this.transactionForm = document.getElementById('transactionForm');
        this.transactionsList = document.getElementById('transactionsList');
        this.totalBalance = document.getElementById('totalBalance');
        this.totalIncome = document.getElementById('totalIncome');
        this.totalExpense = document.getElementById('totalExpense');
        this.filterType = document.getElementById('filterType');
        this.filterCategory = document.getElementById('filterCategory');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.transactionCount = document.getElementById('transactionCount');
        this.monthlyIncome = document.getElementById('monthlyIncome');
        this.monthlyExpense = document.getElementById('monthlyExpense');
        this.monthlyNet = document.getElementById('monthlyNet');
        this.currentYear = document.getElementById('currentYear');
        
        // Chart
        this.categoryChart = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set current date as default
        document.getElementById('date').valueAsDate = new Date();
        
        // Set current year in footer
        this.currentYear.textContent = new Date().getFullYear();
        
        // Load transactions from localStorage
        this.loadTransactions();
        
        // Update UI
        this.updateSummary();
        this.updateTransactionList();
        this.updateChart();
        this.updateMonthlySummary();
        this.updateCategoryFilter();
        
        // Event Listeners
        this.transactionForm.addEventListener('submit', (e) => this.addTransaction(e));
        this.filterType.addEventListener('change', () => this.updateTransactionList());
        this.filterCategory.addEventListener('change', () => this.updateTransactionList());
        this.clearAllBtn.addEventListener('click', () => this.clearAllTransactions());
        
        // Update category options based on transaction type
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCategoryOptions());
        });
        
        // Initial category options update
        this.updateCategoryOptions();
    }
    
    // Get all transactions
    getTransactions() {
        return JSON.parse(localStorage.getItem('budgetTransactions')) || [];
    }
    
    // Save transactions to localStorage
    saveTransactions(transactions) {
        localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
    }
    
    // Load transactions from localStorage
    loadTransactions() {
        this.transactions = this.getTransactions();
    }
    
    // Update category dropdown based on selected type
    updateCategoryOptions() {
        const selectedType = document.querySelector('input[name="type"]:checked').value;
        const categorySelect = document.getElementById('category');
        
        // Reset to default
        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <optgroup label="Income">
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="gift">Gift</option>
                <option value="other-income">Other</option>
            </optgroup>
            <optgroup label="Expenses">
                <option value="food">Food & Dining</option>
                <option value="transport">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="bills">Bills & Utilities</option>
                <option value="health">Health & Medical</option>
                <option value="education">Education</option>
                <option value="other-expense">Other</option>
            </optgroup>
        `;
        
        // Show/hide optgroups based on selected type
        if (selectedType === 'income') {
            categorySelect.querySelector('optgroup[label="Expenses"]').style.display = 'none';
        } else {
            categorySelect.querySelector('optgroup[label="Income"]').style.display = 'none';
        }
    }
    
    // Add a new transaction
    addTransaction(e) {
        e.preventDefault();
        
        // Get form values
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.querySelector('input[name="type"]:checked').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        
        // Validate
        if (!description || !amount || !category || !date) {
            alert('Please fill in all fields');
            return;
        }
        
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date,
            timestamp: new Date().toISOString()
        };
        
        // Add to transactions array
        this.transactions.unshift(transaction);
        
        // Save to localStorage
        this.saveTransactions(this.transactions);
        
        // Update UI
        this.updateSummary();
        this.updateTransactionList();
        this.updateChart();
        this.updateMonthlySummary();
        this.updateCategoryFilter();
        
        // Reset form
        this.transactionForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        document.querySelector('input[name="type"][value="income"]').checked = true;
        this.updateCategoryOptions();
        
        // Show success message
        this.showNotification('Transaction added successfully!', 'success');
    }
    
    // Delete a transaction
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions(this.transactions);
            
            // Update UI
            this.updateSummary();
            this.updateTransactionList();
            this.updateChart();
            this.updateMonthlySummary();
            this.updateCategoryFilter();
            
            this.showNotification('Transaction deleted!', 'warning');
        }
    }
    
    // Clear all transactions
    clearAllTransactions() {
        if (this.transactions.length === 0) {
            alert('No transactions to clear');
            return;
        }
        
        if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveTransactions(this.transactions);
            
            // Update UI
            this.updateSummary();
            this.updateTransactionList();
            this.updateChart();
            this.updateMonthlySummary();
            this.updateCategoryFilter();
            
            this.showNotification('All transactions cleared!', 'warning');
        }
    }
    
    // Update category filter dropdown
    updateCategoryFilter() {
        const categories = [...new Set(this.transactions.map(t => t.category))];
        const filterCategory = document.getElementById('filterCategory');
        
        // Clear existing options except "All Categories"
        filterCategory.innerHTML = '<option value="all">All Categories</option>';
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.getCategoryName(category);
            filterCategory.appendChild(option);
        });
    }
    
    // Get display name for category
    getCategoryName(category) {
        const categoryNames = {
            'salary': 'Salary',
            'freelance': 'Freelance',
            'investment': 'Investment',
            'gift': 'Gift',
            'other-income': 'Other Income',
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'bills': 'Bills & Utilities',
            'health': 'Health & Medical',
            'education': 'Education',
            'other-expense': 'Other Expense'
        };
        
        return categoryNames[category] || category;
    }
    
    // Update summary cards
    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalBalance = totalIncome - totalExpense;
        
        this.totalBalance.textContent = this.formatCurrency(totalBalance);
        this.totalIncome.textContent = this.formatCurrency(totalIncome);
        this.totalExpense.textContent = this.formatCurrency(totalExpense);
    }
    
    // Update monthly summary
    updateMonthlySummary() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyExpense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyNet = monthlyIncome - monthlyExpense;
        
        this.monthlyIncome.textContent = this.formatCurrency(monthlyIncome);
        this.monthlyExpense.textContent = this.formatCurrency(monthlyExpense);
        this.monthlyNet.textContent = this.formatCurrency(monthlyNet);
    }
    
    // Update transaction list
    updateTransactionList() {
        const filterType = this.filterType.value;
        const filterCategory = this.filterCategory.value;
        
        // Filter transactions
        let filteredTransactions = this.transactions;
        
        if (filterType !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
        }
        
        if (filterCategory !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
        }
        
        // Update count
        this.transactionCount.textContent = filteredTransactions.length;
        
        // Clear list
        this.transactionsList.innerHTML = '';
        
        // Check if empty
        if (filteredTransactions.length === 0) {
            this.transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found. ${this.transactions.length === 0 ? 'Add your first transaction!' : 'Try changing your filters.'}</p>
                </div>
            `;
            return;
        }
        
        // Add transactions to list
        filteredTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = `transaction-item ${transaction.type}`;
            transactionElement.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${this.formatDate(transaction.date)}</span>
                        <span class="transaction-category">${this.getCategoryName(transaction.category)}</span>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <button class="delete-btn" onclick="budgetTracker.deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            this.transactionsList.appendChild(transactionElement);
        });
    }
    
    // Update chart
    updateChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Group expenses by category
        const expensesByCategory = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
        
        // Prepare chart data
        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);
        
        // Color palette for categories
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];
        
        // Destroy existing chart if it exists
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }
        
        // Create new chart
        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.map(cat => this.getCategoryName(cat)),
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = amounts.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${this.getCategoryName(context.label)}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Show notification
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-success {
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                }
                .notification-warning {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Helper: Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    // Helper: Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.budgetTracker = new BudgetTracker();
});