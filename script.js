
// Global variables
let books = [];
let members = [];
let transactions = [];
let currentOperation = null;
let currentMember = null;
let html5QrCodeInstance = null;
let scanCooldown = false;
let currentLanguage = 'english'; // Track current language

// Language translations
const translations = {
    english: {
        mainTitle: "Library Management System",
        loginTitle: "Admin Login",
        loginBtn: "Login",
        memberManagementTitle: "Member Management",
        nameHeader: "Name",
        phoneHeader: "Phone",
        statusHeader: "Status",
        actionHeader: "Action",
        checkoutTitle: "Checkout/Checkin Books",
        checkoutBtn: "Checkout Book",
        checkinBtn: "Checkin Book",
        cancelBtn: "Cancel",
        bookManagementTitle: "Book Management",
        addBookBtn: "Add Book",
        showTableBtn: "Show Table",
        exportBtn: "Export Books with QR to Excel",
        titleHeader: "Title",
        authorHeader: "Author",
        ttiCodeHeader: "TTI Code",
        isbnHeader: "ISBN",
        categoryHeader: "Category",
        bookStatusHeader: "Status",
        qrCodeHeader: "QR Code",
        bookActionHeader: "Action",
        transactionHistoryTitle: "Transaction History",
        exportDataBtn: "Export Data",
        deleteAllBtn: "Delete All",
        showTransactionsBtn: "Show Table",
        bookHeader: "Book",
        memberHeader: "Member",
        checkoutDateHeader: "Checkout Date",
        dueDateHeader: "Due Date",
        transactionStatusHeader: "Status",
        selectCategoryOption: "Select Category",
        languageBtn: "بگۆڕە بۆ کوردی",
        activeStatus: "Active",
        overdueStatus: "OVERDUE",
        deleteBtn: "Delete",
        dashboardTitle: "Dashboard",
        totalBooksLabel: "Total Books",
        totalMembersLabel: "Total Members",
        checkedOutLabel: "Checked Out",
        overdueLabel: "Overdue",
        recentBooksLabel: "Recent Books",
        recentMembersLabel: "Recent Members",
        dashboardBtn: "📊 Dashboard"
    },
    kurdish: {
        mainTitle: "سیستەمی بەڕێوەبردنی کتێبخانە",
        loginTitle: "چوونەژوورەوەی بەڕێوەبەر",
        loginBtn: "چوونەژوورەوە",
        memberManagementTitle: "بەڕێوەبردنی ئەندامان",
        nameHeader: "ناو",
        phoneHeader: "ژمارەی مۆبایل",
        statusHeader: "دۆخ",
        actionHeader: "کردار",
        checkoutTitle: "دەرکردن/گەڕانەوەی کتێب",
        checkoutBtn: "دەرکردنی کتێب",
        checkinBtn: "گەڕانەوەی کتێب",
        cancelBtn: "هەڵوەشاندنەوە",
        bookManagementTitle: "بەڕێوەبردنی کتێب",
        addBookBtn: "زیادکردنی کتێب",
        showTableBtn: "پیشاندانی خشتە",
        exportBtn: "هەناردەی کتێبەکان بە QR بۆ Excel",
        titleHeader: "ناونیشان",
        authorHeader: "نووسەر",
        ttiCodeHeader: "کۆدی TTI",
        isbnHeader: "ISBN",
        categoryHeader: "پۆل",
        bookStatusHeader: "دۆخ",
        qrCodeHeader: "کۆدی QR",
        bookActionHeader: "کردار",
        transactionHistoryTitle: "مێژووی مامەڵە",
        exportDataBtn: "هەناردەی داتا",
        deleteAllBtn: "سڕینەوەی هەموو",
        showTransactionsBtn: "پیشاندانی خشتە",
        bookHeader: "کتێب",
        memberHeader: "ئەندام",
        checkoutDateHeader: "بەرواری دەرکردن",
        dueDateHeader: "بەرواری کۆتایی",
        transactionStatusHeader: "دۆخ",
        selectCategoryOption: "هەڵبژاردنی پۆل",
        languageBtn: "Change to English",
        activeStatus: "چالاک",
        overdueStatus: "دواکەوتوو",
        deleteBtn: "سڕینەوە",
        dashboardTitle: "داشبۆرد",
        totalBooksLabel: "کۆی کتێبەکان",
        totalMembersLabel: "کۆی ئەندامان",
        checkedOutLabel: "دەرکراوەکان",
        overdueLabel: "دواکەوتووەکان",
        recentBooksLabel: "کتێبە نوێیەکان",
        recentMembersLabel: "ئەندامە نوێیەکان",
        dashboardBtn: "📊 داشبۆرد"
    }
};

// API base URL
const API_BASE = window.location.origin;

// Initialize data loading
async function loadData() {
    try {
        await Promise.all([loadBooks(), loadMembers(), loadTransactions()]);
    } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to localStorage if API fails
        books = JSON.parse(localStorage.getItem("books")) || [];
        members = JSON.parse(localStorage.getItem("members")) || [];
        transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        updateDisplays();
    }
}

// Load books from API
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE}/api/books`);
        if (response.ok) {
            const apiBooks = await response.json();
            books = apiBooks || [];
            console.log(`Loaded ${books.length} books from API`);
        } else {
            console.log("API not available, using localStorage");
            books = JSON.parse(localStorage.getItem("books")) || [];
        }
    } catch (error) {
        console.log("Error loading books, using localStorage:", error.message);
        books = JSON.parse(localStorage.getItem("books")) || [];
    }
    displayBooks();
}

// Load members from API
async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE}/api/members`);
        if (response.ok) {
            const apiMembers = await response.json();
            members = apiMembers || [];
            console.log(`Loaded ${members.length} members from API`);
        } else {
            console.log("API not available, using localStorage");
            members = JSON.parse(localStorage.getItem("members")) || [];
        }
    } catch (error) {
        console.log("Error loading members, using localStorage:", error.message);
        members = JSON.parse(localStorage.getItem("members")) || [];
    }
    displayMembers();
}

// Load transactions from API
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/api/transactions`);
        if (response.ok) {
            const apiTransactions = await response.json();
            transactions = apiTransactions || [];
            console.log(`Loaded ${transactions.length} transactions from API`);
        } else {
            console.log("API not available, using localStorage");
            transactions = JSON.parse(localStorage.getItem("transactions")) || [];
        }
    } catch (error) {
        console.log("Error loading transactions, using localStorage:", error.message);
        transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    }
    displayTransactions();
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Ensure all required DOM elements exist before initializing
    const requiredElements = [
        'loginPanel', 'mainContent', 'booksList', 'membersList', 
        'transactionsList', 'reader', 'currentOperation'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));

    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        return;
    }

    loadData();
});

// Login function
async function login() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;
    if (user === "diwan" && pass === "diwan1993") {
        document.getElementById("loginPanel").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
        await loadData();
    } else {
        document.getElementById("loginMessage").textContent = "Invalid login credentials!";
    }
}

// Local Storage Helpers (fallback)
function saveBooks() {
    localStorage.setItem("books", JSON.stringify(books));
}

function saveMembers() {
    localStorage.setItem("members", JSON.stringify(members));
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Book Management
function displayBooks() {
    const booksList = document.getElementById("booksList");
    booksList.innerHTML = "";
    books.forEach((book, index) => {
        const tr = document.createElement("tr");
        const qrCellId = `qrcode-${index}`;

        // Normalize the ttiCode field
        const ttiCode = book.ttiCode || book.tticode || '';

        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${ttiCode}</td>
            <td>${book.isbn || ''}</td>
            <td>${book.category}</td>
            <td>${book.status}</td>
            <td><canvas id="${qrCellId}"></canvas></td>
            <td><button onclick="deleteBook(${index})">${translations[currentLanguage].deleteBtn}</button></td>
        `;
        booksList.appendChild(tr);

        // Generate QR code with consistent format - use TTI Code as primary identifier
        let qrValue;
        if (ttiCode && ttiCode.trim()) {
            qrValue = `TTI:${ttiCode.trim()}`;
        } else if (book.isbn && book.isbn.trim()) {
            qrValue = `ISBN:${book.isbn.trim()}`;
        } else {
            qrValue = `BOOK:${book.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
        }

        console.log(`Generating QR code for book "${book.title}" with value: ${qrValue}`);

        const qrCanvas = document.getElementById(qrCellId);
        if (qrCanvas) {
            QRCode.toCanvas(qrCanvas, qrValue, { 
                width: 100,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, (error) => {
                if (error) console.error('QR Code generation error:', error);
            });
        } else {
            console.error('QR Canvas element not found:', qrCellId);
        }
    });
}

async function addBook() {
    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;
    const ttiCode = document.getElementById("bookTtiCode").value;
    const isbn = document.getElementById("bookIsbn").value;
    const category = document.getElementById("bookCategory").value;

    if (!title || !author || !ttiCode || !category) {
        alert("Title, Author, TTI Code, and Category are required.");
        return;
    }

    const book = { title, author, ttiCode, isbn: isbn || "", category, status: "Available" };

    try {
        const response = await fetch(`${API_BASE}/api/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });

        if (response.ok) {
            books.push(book);
            displayBooks();
        } else {
            // Fallback to localStorage
            books.push(book);
            saveBooks();
            displayBooks();
        }
    } catch (error) {
        console.error("Error adding book:", error);
        books.push(book);
        saveBooks();
        displayBooks();
    }

    // Clear form
    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookTtiCode").value = "";
    document.getElementById("bookIsbn").value = "";
    document.getElementById("bookCategory").value = "";
}

function deleteBook(index) {
    if (confirm("Are you sure you want to delete this book?")) {
        books.splice(index, 1);
        saveBooks();
        displayBooks();
    }
}

// Member Management
// Members are now automatically added during checkout process
// No manual member input needed

// Language toggle function
function toggleLanguage() {
    currentLanguage = currentLanguage === 'english' ? 'kurdish' : 'english';
    updateLanguage();
}

function toggleDashboard() {
    const dashboardPanel = document.getElementById('dashboardPanel');
    const dashboardBtn = document.getElementById('dashboardBtn');
    
    if (dashboardPanel.style.display === 'none') {
        dashboardPanel.style.display = 'block';
        dashboardBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        updateDashboard();
    } else {
        dashboardPanel.style.display = 'none';
        dashboardBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

function updateLanguage() {
    const lang = translations[currentLanguage];
    
    // Update text direction and alignment based on language
    const isRTL = currentLanguage === 'kurdish';
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
    document.body.style.textAlign = isRTL ? 'right' : 'left';
    
    // Update main title
    const mainTitleElement = document.getElementById('mainTitle');
    mainTitleElement.textContent = lang.mainTitle;
    mainTitleElement.style.textAlign = 'center';
    mainTitleElement.style.direction = 'ltr';
    mainTitleElement.style.width = '100%';
    mainTitleElement.style.display = 'block';
    mainTitleElement.style.margin = '0 auto';
    
    // Update login panel
    document.getElementById('loginTitle').textContent = lang.loginTitle;
    document.getElementById('loginBtn').textContent = lang.loginBtn;
    
    // Update member management
    document.getElementById('memberManagementTitle').textContent = lang.memberManagementTitle;
    document.getElementById('nameHeader').textContent = lang.nameHeader;
    document.getElementById('phoneHeader').textContent = lang.phoneHeader;
    document.getElementById('statusHeader').textContent = lang.statusHeader;
    document.getElementById('actionHeader').textContent = lang.actionHeader;
    
    // Update checkout panel
    document.getElementById('checkoutTitle').textContent = lang.checkoutTitle;
    document.getElementById('checkoutBtn').textContent = lang.checkoutBtn;
    document.getElementById('checkinBtn').textContent = lang.checkinBtn;
    document.getElementById('cancelBtn').textContent = lang.cancelBtn;
    
    // Update book management
    document.getElementById('bookManagementTitle').textContent = lang.bookManagementTitle;
    document.getElementById('addBookBtn').textContent = lang.addBookBtn;
    document.getElementById('showTableBtn').textContent = lang.showTableBtn;
    document.getElementById('exportBtn').textContent = lang.exportBtn;
    document.getElementById('selectCategoryOption').textContent = lang.selectCategoryOption;
    
    // Update book table headers
    document.getElementById('titleHeader').textContent = lang.titleHeader;
    document.getElementById('authorHeader').textContent = lang.authorHeader;
    document.getElementById('ttiCodeHeader').textContent = lang.ttiCodeHeader;
    document.getElementById('isbnHeader').textContent = lang.isbnHeader;
    document.getElementById('categoryHeader').textContent = lang.categoryHeader;
    document.getElementById('bookStatusHeader').textContent = lang.bookStatusHeader;
    document.getElementById('qrCodeHeader').textContent = lang.qrCodeHeader;
    document.getElementById('bookActionHeader').textContent = lang.bookActionHeader;
    
    // Update transaction history
    document.getElementById('transactionHistoryTitle').textContent = lang.transactionHistoryTitle;
    document.getElementById('exportDataBtn').textContent = lang.exportDataBtn;
    document.getElementById('deleteAllBtn').textContent = lang.deleteAllBtn;
    document.getElementById('showTransactionsBtn').textContent = lang.showTransactionsBtn;
    
    // Update transaction table headers
    document.getElementById('bookHeader').textContent = lang.bookHeader;
    document.getElementById('memberHeader').textContent = lang.memberHeader;
    document.getElementById('checkoutDateHeader').textContent = lang.checkoutDateHeader;
    document.getElementById('dueDateHeader').textContent = lang.dueDateHeader;
    document.getElementById('transactionStatusHeader').textContent = lang.transactionStatusHeader;
    
    // Update dashboard
    document.getElementById('dashboardTitle').textContent = lang.dashboardTitle;
    document.getElementById('totalBooksLabel').textContent = lang.totalBooksLabel;
    document.getElementById('totalMembersLabel').textContent = lang.totalMembersLabel;
    document.getElementById('checkedOutLabel').textContent = lang.checkedOutLabel;
    document.getElementById('overdueLabel').textContent = lang.overdueLabel;
    document.getElementById('recentBooksLabel').textContent = lang.recentBooksLabel;
    document.getElementById('recentMembersLabel').textContent = lang.recentMembersLabel;
    document.getElementById('dashboardBtn').textContent = lang.dashboardBtn;
    
    // Update language button
    document.getElementById('languageToggle').textContent = lang.languageBtn;
    
    // Update dynamic content
    displayMembers();
    displayBooks();
    displayTransactions();
    updateDashboard();
}

// Dashboard update function
function updateDashboard() {
    // Update statistics
    document.getElementById('totalBooksCount').textContent = books.length;
    document.getElementById('totalMembersCount').textContent = members.length;
    
    // Count checked out books
    const checkedOutBooks = books.filter(book => book.status === 'Checked Out').length;
    document.getElementById('checkedOutCount').textContent = checkedOutBooks;
    
    // Count overdue books
    const today = new Date();
    const overdueBooks = transactions.filter(t => {
        if (t.status !== 'Checked Out') return false;
        const dueDate = new Date(t.due_date);
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        return daysOverdue > 14;
    }).length;
    document.getElementById('overdueCount').textContent = overdueBooks;
    
    // Update recent books (last 5 added)
    const recentBooksList = document.getElementById('recentBooksList');
    recentBooksList.innerHTML = '';
    const recentBooks = books.slice(-5).reverse();
    recentBooks.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'recent-item';
        bookItem.innerHTML = `
            <div class="recent-item-title">${book.title}</div>
            <div class="recent-item-subtitle">${book.author}</div>
            <div class="recent-item-status ${book.status === 'Available' ? 'available' : 'checked-out'}">${book.status}</div>
        `;
        recentBooksList.appendChild(bookItem);
    });
    
    // Update recent members (last 5 added)
    const recentMembersList = document.getElementById('recentMembersList');
    recentMembersList.innerHTML = '';
    const recentMembers = members.slice(-5).reverse();
    recentMembers.forEach(member => {
        const memberItem = document.createElement('div');
        memberItem.className = 'recent-item';
        memberItem.innerHTML = `
            <div class="recent-item-title">${member.name}</div>
            <div class="recent-item-subtitle">${member.phone || 'No phone'}</div>
            <div class="recent-item-status active">Active</div>
        `;
        recentMembersList.appendChild(memberItem);
    });
}

function displayMembers() {
    const membersList = document.getElementById("membersList");
    membersList.innerHTML = "";
    
    // Get overdue information for each member
    const today = new Date();
    const overdueTransactions = transactions.filter(t => {
        if (t.status !== "Checked Out") return false;
        const dueDate = new Date(t.due_date);
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        return daysOverdue > 14;
    });
    
    members.forEach((member, index) => {
        const tr = document.createElement("tr");
        
        // Check if member has overdue books
        const overdueBooks = overdueTransactions.filter(t => 
            t.member_name.toLowerCase() === member.name.toLowerCase()
        );
        
        let status = translations[currentLanguage].activeStatus;
        let rowClass = "";
        
        if (overdueBooks.length > 0) {
            status = `${translations[currentLanguage].overdueStatus} (${overdueBooks.length} ${currentLanguage === 'kurdish' ? 'کتێب' : 'book(s)'})`;
            rowClass = "overdue-member";
        }
        
        tr.className = rowClass;
        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.phone || 'N/A'}</td>
            <td style="color: ${overdueBooks.length > 0 ? 'red' : 'green'}; font-weight: bold;">${status}</td>
            <td><button onclick="deleteMember(${index})">${translations[currentLanguage].deleteBtn}</button></td>
        `;
        membersList.appendChild(tr);
    });
}

function deleteMember(index) {
    if (confirm("Are you sure you want to delete this member?")) {
        members.splice(index, 1);
        saveMembers();
        displayMembers();
        updateDashboard();
    }
}

// Overdue status is now shown directly in the member management table
// No separate overdue members display needed

// Transaction Handling
function startCheckout() {
    currentOperation = "checkout";
    currentMember = null;
    document.getElementById("currentOperation").textContent = "Checkout mode active. Scan a member card or book.";
    document.getElementById("transactionInfo").innerHTML = "";
    startScanner();
}

function startCheckin() {
    currentOperation = "checkin";
    currentMember = null;
    document.getElementById("currentOperation").textContent = "Checkin mode active. Scan a book.";
    document.getElementById("transactionInfo").innerHTML = "";
    startScanner();
}

function cancelOperation() {
    currentOperation = null;
    currentMember = null;
    document.getElementById("currentOperation").textContent = "";
    document.getElementById("transactionInfo").innerHTML = "";
    stopScanner();
}

// Enhanced QR/Barcode detection
function handleQRCode(scannedCode) {
    console.log("Scanned code:", scannedCode);

    // Clean the scanned code
    const cleanCode = scannedCode.trim();

    // Check if it's a member ID (starts with M)
    const member = members.find(m => 
        m.id === cleanCode || 
        m.id.toLowerCase() === cleanCode.toLowerCase()
    );

    if (member && currentOperation === "checkout") {
        document.getElementById("currentOperation").textContent = `Member selected: ${member.name}. Now scan a book.`;
        currentMember = member;
        return;
    }

    // Enhanced book detection with proper format matching
    const book = books.find(b => {
        const ttiCode = b.ttiCode || b.tticode || '';
        const isbn = b.isbn || '';

        // Match our generated QR code formats
        if (cleanCode === `TTI:${ttiCode}` && ttiCode) return true;
        if (cleanCode === `ISBN:${isbn}` && isbn) return true;
        if (cleanCode === `BOOK:${b.title.replace(/[^a-zA-Z0-9]/g, '_')}`) return true;

        // Direct matches (for external barcodes)
        if (isbn && isbn === cleanCode) return true;
        if (ttiCode && ttiCode === cleanCode) return true;

        // Case insensitive matches
        if (isbn && isbn.toLowerCase() === cleanCode.toLowerCase()) return true;
        if (ttiCode && ttiCode.toLowerCase() === cleanCode.toLowerCase()) return true;

        // Partial matches for barcodes that might have extra characters
        if (isbn && (cleanCode.includes(isbn) || isbn.includes(cleanCode))) return true;
        if (ttiCode && (cleanCode.includes(ttiCode) || ttiCode.includes(cleanCode))) return true;

        return false;
    });

    if (!book) {
        console.log("Book not found for code:", cleanCode);
        console.log("Available books with QR formats:", books.map(b => {
            const ttiCode = b.ttiCode || b.tticode || '';
            const isbn = b.isbn || '';
            return {
                title: b.title, 
                isbn: isbn || 'No ISBN', 
                ttiCode: ttiCode || 'No TTI Code',
                qrFormats: [
                    ttiCode ? `TTI:${ttiCode}` : '',
                    isbn ? `ISBN:${isbn}` : '',
                    `BOOK:${b.title.replace(/[^a-zA-Z0-9]/g, '_')}`
                ].filter(f => f)
            };
        }));
        alert(`Book not found for code: ${cleanCode}\nPlease check if the book is registered in the system.`);
        return;
    }

    console.log("Book found:", book);

    if (currentOperation === "checkout") {
        handleCheckout(book);
    } else if (currentOperation === "checkin") {
        handleCheckin(book);
    }
}

async function handleCheckout(book) {
    if (book.status === "Checked Out") {
        alert("Book already checked out!");
        return;
    }

    let memberName = "";
    let memberPhone = "";
    
    if (currentMember) {
        memberName = currentMember.name;
        memberPhone = currentMember.phone || "";
    } else {
        memberName = prompt("Enter member name:");
        if (!memberName) {
            alert("Checkout cancelled. Member name required.");
            return;
        }
        
        memberPhone = prompt("Enter member phone number (optional):");
    }

    // Check if member exists, if not add them automatically
    let existingMember = members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
    if (!existingMember) {
        const memberId = `M${Date.now()}`;
        const newMember = { name: memberName, id: memberId, phone: memberPhone };
        
        try {
            const response = await fetch(`${API_BASE}/api/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: memberName, memberId, phone: memberPhone })
            });

            if (response.ok) {
                const result = await response.json();
                newMember.id = result.id;
                members.push(newMember);
                displayMembers();
            } else {
                members.push(newMember);
                saveMembers();
                displayMembers();
            }
        } catch (error) {
            console.error("Error auto-adding member:", error);
            members.push(newMember);
            saveMembers();
            displayMembers();
        }
        
        alert(`New member "${memberName}" has been automatically added to the system.`);
    }

    const date = new Date();
    const dueDate = new Date(date);
    dueDate.setDate(date.getDate() + 14);

    const transaction = {
        book_title: book.title,
        member_name: memberName,
        checkout_date: date.toLocaleDateString(),
        due_date: dueDate.toLocaleDateString(),
        status: "Checked Out"
    };

    try {
        // Update book status
        book.status = "Checked Out";

        // Add transaction to API
        const response = await fetch(`${API_BASE}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });

        if (response.ok) {
            transactions.push(transaction);
        } else {
            // Fallback to localStorage
            transactions.push(transaction);
            saveTransactions();
        }
    } catch (error) {
        console.error("Error saving transaction:", error);
        transactions.push(transaction);
        saveTransactions();
    }

    saveBooks();
    displayBooks();
    displayTransactions();
    updateDashboard();

    alert(`Book "${book.title}" checked out to ${memberName}`);
    document.getElementById("transactionInfo").innerHTML = `
        <p><strong>Success!</strong> Book "${book.title}" checked out to ${memberName}</p>
        <p>Due date: ${dueDate.toLocaleDateString()}</p>
    `;

    resetOperation();
}

async function handleCheckin(book) {
    if (book.status === "Available") {
        alert("Book is already available.");
        return;
    }

    book.status = "Available";
    const transaction = transactions.find(t => t.book_title === book.title && t.status === "Checked Out");
    if (transaction) transaction.status = "Returned";

    saveBooks();
    saveTransactions();
    displayBooks();
    displayTransactions();
    updateDashboard();

    alert(`Book "${book.title}" checked in successfully`);
    document.getElementById("transactionInfo").innerHTML = `
        <p><strong>Success!</strong> Book "${book.title}" has been returned</p>
    `;

    resetOperation();
}

function resetOperation() {
    currentOperation = null;
    currentMember = null;
    document.getElementById("currentOperation").textContent = "";
    stopScanner();
}

function displayTransactions() {
    const transactionsList = document.getElementById("transactionsList");
    transactionsList.innerHTML = "";
    transactions.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.book_title || t.book}</td>
            <td>${t.member_name || t.member}</td>
            <td>${t.checkout_date || t.checkoutDate}</td>
            <td>${t.due_date || t.dueDate}</td>
            <td>${t.status}</td>
        `;
        transactionsList.appendChild(tr);
    });
}

function clearTransactions() {
    if (confirm("Are you sure you want to delete all transactions?")) {
        transactions = [];
        saveTransactions();
        displayTransactions();
        alert("All transactions have been deleted.");
    }
}

function exportTransactions() {
    if (transactions.length === 0) {
        alert("No transactions to export.");
        return;
    }

    let csvContent = "Book,Member,Checkout Date,Due Date,Status\n";
    transactions.forEach(t => {
        csvContent += `${t.book_title || t.book},${t.member_name || t.member},${t.checkout_date || t.checkoutDate},${t.due_date || t.dueDate},${t.status}\n`;
    });

    // Add UTF-8 BOM for Arabic support
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Enhanced QR Scanner with better camera handling
function startScanner() {
    if (html5QrCodeInstance) {
        html5QrCodeInstance.stop().then(() => {
            html5QrCodeInstance.clear();
            html5QrCodeInstance = null;
            setTimeout(() => initializeScanner(), 500);
        }).catch(err => {
            console.log("Error stopping scanner:", err);
            html5QrCodeInstance = null;
            initializeScanner();
        });
    } else {
        initializeScanner();
    }
}

function initializeScanner() {
    try {
        html5QrCodeInstance = new Html5Qrcode("reader");

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                // Prefer back camera for better barcode scanning
                let cameraId = devices[0].id;
                for (let device of devices) {
                    if (device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('environment')) {
                        cameraId = device.id;
                        break;
                    }
                }

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    disableFlip: false,
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_QR_CODE,
                        Html5QrcodeScanType.SCAN_TYPE_BARCODE
                    ],
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true
                };

                html5QrCodeInstance.start(
                    cameraId,
                    config,
                    qrCodeMessage => {
                        if (!scanCooldown && currentOperation) {
                            scanCooldown = true;
                            console.log("QR/Barcode detected:", qrCodeMessage);
                            handleQRCode(qrCodeMessage);
                            setTimeout(() => scanCooldown = false, 2000);
                        }
                    },
                    error => {
                        // Silent error handling for continuous scanning
                        // console.log("Scan error:", error);
                    }
                ).catch(err => {
                    console.error("Unable to start scanning:", err);
                    alert("Unable to start camera. Please check camera permissions.");
                });
            } else {
                alert("No cameras found on this device.");
            }
        }).catch(err => {
            console.error("Error getting cameras:", err);
            // Fallback to environment facing mode
            html5QrCodeInstance.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                    aspectRatio: 1.0,
                    supportedScanTypes: [
                        Html5QrcodeScanType.SCAN_TYPE_QR_CODE,
                        Html5QrcodeScanType.SCAN_TYPE_BARCODE
                    ]
                },
                qrCodeMessage => {
                    if (!scanCooldown && currentOperation) {
                        scanCooldown = true;
                        handleQRCode(qrCodeMessage);
                        setTimeout(() => scanCooldown = false, 2000);
                    }
                },
                error => {}
            ).catch(err => {
                console.error("Camera initialization failed:", err);
                alert("Camera initialization failed. Please check permissions.");
            });
        });
    } catch (error) {
        console.error("Scanner initialization error:", error);
        alert("Scanner initialization failed.");
    }
}

function stopScanner() {
    if (html5QrCodeInstance) {
        html5QrCodeInstance.stop().then(() => {
            html5QrCodeInstance.clear();
            html5QrCodeInstance = null;
        }).catch(err => {
            console.log("Error stopping scanner:", err);
            html5QrCodeInstance = null;
        });
    }
    const readerElement = document.getElementById("reader");
    const transactionInfoElement = document.getElementById("transactionInfo");

    if (readerElement) readerElement.innerHTML = "";
    if (transactionInfoElement) transactionInfoElement.innerHTML = "";
}

// Update all displays
function updateDisplays() {
    try {
        displayBooks();
        displayMembers();
        displayTransactions();
        updateDashboard();
    } catch (error) {
        console.error("Error updating displays:", error);
    }
}

// Table Toggle Functions
function toggleBooksTable() {
    const table = document.getElementById("booksTable");
    const button = event.target;

    if (table.style.display === "none") {
        table.style.display = "table";
        button.textContent = "Hide Table";
    } else {
        table.style.display = "none";
        button.textContent = "Show Table";
    }
}

function toggleTransactionsTable() {
    const table = document.getElementById("transactionsTable");
    const button = event.target;

    if (table.style.display === "none") {
        table.style.display = "table";
        button.textContent = "Hide Table";
    } else {
        table.style.display = "none";
        button.textContent = "Show Table";
    }
}
function exportBooks() {
    if (books.length === 0) {
        alert("No books to export.");
        return;
    }

    let csvContent = "Title,Author,TTI Code,ISBN,Category,Status\n";
    books.forEach(book => {
        const title = book.title || "";
        const author = book.author || "";
        const ttiCode = book.ttiCode || book.tticode || "";
        const isbn = book.isbn || "";
        const category = book.category || "";
        const status = book.status || "Available";
        csvContent += `${title},${author},${ttiCode},${isbn},${category},${status}\n`;
    });

    // Add UTF-8 BOM for Arabic support
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "books.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportBooksToExcelWithQR() {
    if (books.length === 0) {
        alert("No books to export.");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Books");

    // Add header row
    worksheet.addRow(["Title", "Author", "TTI Code", "ISBN", "Category", "Status", "QR Code"]);

    // For each book, generate QR code and add row
    for (const book of books) {
        const row = worksheet.addRow([
            book.title || "",
            book.author || "",
            book.ttiCode || book.tticode || "",
            book.isbn || "",
            book.category || "",
            book.status || "Available"
        ]);

        // Generate QR code as data URL
        const qrValue = book.ttiCode || book.tticode || "";
        if (qrValue) {
            const qrDataUrl = await QRCode.toDataURL(`TTI:${qrValue}`);
            // Add image to workbook
            const imageId = workbook.addImage({
                base64: qrDataUrl,
                extension: 'png',
            });
            worksheet.addImage(imageId, {
                tl: { col: 6, row: row.number - 1 }, // 7th column (0-indexed)
                ext: { width: 80, height: 80 }
            });
        }
    }

    // Adjust column widths
    worksheet.columns.forEach((col, i) => {
        col.width = i === 6 ? 15 : 20; // QR column a bit smaller
    });

    // Download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "books_with_qr.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportBooksToPDF() {
    const { jsPDF } = window.jspdf;
    if (books.length === 0) {
        alert("No books to export.");
        return;
    }

    const doc = new jsPDF();
    // Check if books have a created_at field
    const hasCreatedAt = books.some(book => book.created_at);
    const tableColumn = (hasCreatedAt ? ["Created At"] : []).concat(["QR Code"]);
    const tableRows = [];
    const qrImages = [];

    // Generate QR codes and prepare table data
    for (const book of books) {
        const row = [];
        if (hasCreatedAt) {
            row.push(book.created_at || "");
        }
        row.push(""); // Placeholder for QR code
        tableRows.push(row);
        // Generate QR code as data URL
        const qrValue = book.ttiCode || book.tticode || "";
        if (qrValue) {
            const qrDataUrl = await QRCode.toDataURL(`TTI:${qrValue}`);
            qrImages.push(qrDataUrl);
        } else {
            qrImages.push(null);
        }
    }

    // Draw table (without QR codes)
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        styles: { font: "helvetica", fontStyle: "normal" },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawCell: function (data) {
            // Add QR code image to the last column
            if (data.column.index === tableColumn.length - 1 && data.row.index < qrImages.length) {
                const qrImg = qrImages[data.row.index];
                if (qrImg) {
                    // Set QR code size to 30x30 points
                    const imgSize = 30;
                    const cellWidth = data.cell.width;
                    const cellHeight = data.cell.height;
                    // Center the QR code in the cell
                    const x = data.cell.x + (cellWidth - imgSize) / 2;
                    const y = data.cell.y + (cellHeight - imgSize) / 2;
                    doc.addImage(qrImg, 'PNG', x, y, imgSize, imgSize);
                }
            }
        },
        willDrawCell: function (data) {
            // Set minimum row height for QR code column
            if (data.column.index === tableColumn.length - 1 && data.section === 'body') {
                data.cell.height = Math.max(data.cell.height, 36);
            }
        }
    });

    doc.save("books_with_qr.pdf");
}

