
-- Library Management System Database Schema for Microsoft SQL Server
-- Created for QR Code-based Library Management System

-- Create Database (uncomment if creating new database)
-- CREATE DATABASE LibraryManagementSystem;
-- GO
-- USE LibraryManagementSystem;
-- GO

-- Drop tables if they exist (for clean reinstall)
IF OBJECT_ID('transactions', 'U') IS NOT NULL DROP TABLE transactions;
IF OBJECT_ID('books', 'U') IS NOT NULL DROP TABLE books;
IF OBJECT_ID('members', 'U') IS NOT NULL DROP TABLE members;
GO

-- Create Members Table
CREATE TABLE members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    member_id NVARCHAR(50) UNIQUE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Books Table
CREATE TABLE books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    tticode NVARCHAR(100) UNIQUE NOT NULL,
    isbn NVARCHAR(20) NULL,
    category NVARCHAR(100) NOT NULL,
    status NVARCHAR(20) DEFAULT 'Available',
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Transactions Table
CREATE TABLE transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    book_title NVARCHAR(255) NOT NULL,
    member_name NVARCHAR(255) NOT NULL,
    checkout_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status NVARCHAR(20) DEFAULT 'Checked Out',
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Indexes for better performance
CREATE INDEX IX_books_tticode ON books(tticode);
CREATE INDEX IX_books_isbn ON books(isbn);
CREATE INDEX IX_books_status ON books(status);
CREATE INDEX IX_members_member_id ON members(member_id);
CREATE INDEX IX_transactions_status ON transactions(status);
CREATE INDEX IX_transactions_book_title ON transactions(book_title);
GO

-- Insert sample members
INSERT INTO members (name, member_id) VALUES
('Ahmed Ali', 'M001'),
('Sara Mohammed', 'M002'),
('Omar Hassan', 'M003'),
('Fatima Khalil', 'M004'),
('Yusuf Ibrahim', 'M005');
GO

-- Insert sample books with various categories
INSERT INTO books (title, author, tticode, isbn, category, status) VALUES
-- Nursing Books
('Fundamentals of Nursing', 'Patricia Potter', 'TTI001', '9780323673587', 'Nursing', 'Available'),
('Medical-Surgical Nursing', 'Sharon Lewis', 'TTI002', '9780323551496', 'Nursing', 'Available'),
('Pediatric Nursing Care', 'Susan James', 'TTI003', '9780323694735', 'Nursing', 'Available'),

-- Business Administration Books
('Principles of Management', 'Stephen Robbins', 'TTI004', '9780134486833', 'Business Administration', 'Available'),
('Marketing Management', 'Philip Kotler', 'TTI005', '9780134236933', 'Business Administration', 'Available'),
('Financial Accounting', 'Jerry Weygandt', 'TTI006', '9781119691334', 'Business Administration', 'Available'),

-- Medical Laboratory Technician Books
('Clinical Laboratory Science', 'Doig Kaplan', 'TTI007', '9780323711234', 'Medical Laboratory Technician', 'Available'),
('Hematology Procedures', 'John Rodak', 'TTI008', '9780323711567', 'Medical Laboratory Technician', 'Available'),
('Clinical Microbiology', 'George Manuselis', 'TTI009', '9780323711890', 'Medical Laboratory Technician', 'Available'),

-- Medical Books
('Gray''s Anatomy', 'Henry Gray', 'TTI010', '9780702077050', 'Medical', 'Available'),
('Harrison''s Principles of Internal Medicine', 'Dennis Kasper', 'TTI011', '9781259644030', 'Medical', 'Available'),
('Pathology Fundamentals', 'Vinay Kumar', 'TTI012', '9780323673211', 'Medical', 'Available'),

-- General Academic Books
('Introduction to Psychology', 'James Kalat', 'TTI013', '9781337565691', 'Psychology', 'Available'),
('World History', 'William Duiker', 'TTI014', '9781337401142', 'History', 'Available'),
('English Literature', 'M.H. Abrams', 'TTI015', '9780393603392', 'Literary fiction', 'Available'),

-- Yearbook Publishing Books
('Yearbook Design Fundamentals', 'Sarah Mitchell', 'TTI016', '9781234567890', 'Yearbook Publishing', 'Available'),
('Digital Photography for Yearbooks', 'Robert Chen', 'TTI017', '9781234567891', 'Yearbook Publishing', 'Available'),
('Layout and Typography Guide', 'Emily Johnson', 'TTI018', '9781234567892', 'Yearbook Publishing', 'Available'),
('Yearbook Production Management', 'David Wilson', 'TTI019', '9781234567893', 'Yearbook Publishing', 'Available');
GO

-- Insert sample transactions
INSERT INTO transactions (book_title, member_name, checkout_date, due_date, status) VALUES
('Fundamentals of Nursing', 'Ahmed Ali', '2024-01-15', '2024-01-29', 'Returned'),
('Principles of Management', 'Sara Mohammed', '2024-01-20', '2024-02-03', 'Checked Out'),
('Clinical Laboratory Science', 'Omar Hassan', '2024-01-22', '2024-02-05', 'Checked Out'),
('Gray''s Anatomy', 'Fatima Khalil', '2024-01-25', '2024-02-08', 'Returned'),
('Marketing Management', 'Yusuf Ibrahim', '2024-01-28', '2024-02-11', 'Checked Out');
GO

-- Update book status based on current transactions
UPDATE books 
SET status = 'Checked Out'
WHERE title IN (
    SELECT book_title 
    FROM transactions 
    WHERE status = 'Checked Out'
);
GO

-- Create Views for reporting
CREATE VIEW v_available_books AS
SELECT 
    id,
    title,
    author,
    tticode,
    isbn,
    category,
    created_at
FROM books 
WHERE status = 'Available';
GO

CREATE VIEW v_checked_out_books AS
SELECT 
    b.title,
    b.author,
    b.tticode,
    t.member_name,
    t.checkout_date,
    t.due_date,
    CASE 
        WHEN t.due_date < CAST(GETDATE() AS DATE) THEN 'Overdue'
        ELSE 'On Time'
    END as loan_status
FROM books b
INNER JOIN transactions t ON b.title = t.book_title
WHERE b.status = 'Checked Out' AND t.status = 'Checked Out';
GO

CREATE VIEW v_transaction_summary AS
SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'Checked Out' THEN 1 END) as active_checkouts,
    COUNT(CASE WHEN status = 'Returned' THEN 1 END) as returned_books,
    COUNT(CASE WHEN due_date < CAST(GETDATE() AS DATE) AND status = 'Checked Out' THEN 1 END) as overdue_books
FROM transactions;
GO

-- Create Stored Procedures for common operations

-- Procedure to checkout a book
CREATE PROCEDURE sp_checkout_book
    @book_tticode NVARCHAR(100),
    @member_name NVARCHAR(255),
    @checkout_date DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @checkout_date IS NULL
        SET @checkout_date = CAST(GETDATE() AS DATE);
    
    DECLARE @due_date DATE = DATEADD(day, 14, @checkout_date);
    DECLARE @book_title NVARCHAR(255);
    
    -- Get book title and check availability
    SELECT @book_title = title 
    FROM books 
    WHERE tticode = @book_tticode AND status = 'Available';
    
    IF @book_title IS NULL
    BEGIN
        RAISERROR('Book not found or not available', 16, 1);
        RETURN;
    END
    
    -- Update book status
    UPDATE books 
    SET status = 'Checked Out' 
    WHERE tticode = @book_tticode;
    
    -- Insert transaction record
    INSERT INTO transactions (book_title, member_name, checkout_date, due_date, status)
    VALUES (@book_title, @member_name, @checkout_date, @due_date, 'Checked Out');
    
    SELECT 'Book checked out successfully' as message, @due_date as due_date;
END;
GO

-- Procedure to checkin a book
CREATE PROCEDURE sp_checkin_book
    @book_tticode NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @book_title NVARCHAR(255);
    
    -- Get book title and check if it's checked out
    SELECT @book_title = title 
    FROM books 
    WHERE tticode = @book_tticode AND status = 'Checked Out';
    
    IF @book_title IS NULL
    BEGIN
        RAISERROR('Book not found or not checked out', 16, 1);
        RETURN;
    END
    
    -- Update book status
    UPDATE books 
    SET status = 'Available' 
    WHERE tticode = @book_tticode;
    
    -- Update transaction status
    UPDATE transactions 
    SET status = 'Returned' 
    WHERE book_title = @book_title AND status = 'Checked Out';
    
    SELECT 'Book checked in successfully' as message;
END;
GO

-- Function to get overdue books
CREATE FUNCTION fn_get_overdue_books()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        b.title,
        b.author,
        b.tticode,
        t.member_name,
        t.checkout_date,
        t.due_date,
        DATEDIFF(day, t.due_date, GETDATE()) as days_overdue
    FROM books b
    INNER JOIN transactions t ON b.title = t.book_title
    WHERE b.status = 'Checked Out' 
      AND t.status = 'Checked Out'
      AND t.due_date < CAST(GETDATE() AS DATE)
);
GO

-- Sample queries for testing and reporting

-- Query to see all available books by category
-- SELECT category, COUNT(*) as available_count
-- FROM v_available_books
-- GROUP BY category
-- ORDER BY category;

-- Query to see current checkouts
-- SELECT * FROM v_checked_out_books;

-- Query to see overdue books
-- SELECT * FROM fn_get_overdue_books();

-- Query to get transaction summary
-- SELECT * FROM v_transaction_summary;

-- Example of using stored procedures
-- EXEC sp_checkout_book 'TTI001', 'Ahmed Ali';
-- EXEC sp_checkin_book 'TTI001';

PRINT 'Library Management System database schema created successfully!';
PRINT 'Database includes:';
PRINT '- 3 main tables: books, members, transactions';
PRINT '- Sample data for testing';
PRINT '- Indexes for performance';
PRINT '- Views for reporting';
PRINT '- Stored procedures for checkout/checkin operations';
PRINT '- Functions for overdue book tracking';
GO
