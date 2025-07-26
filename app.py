from flask import Flask, render_template, request, jsonify, send_from_directory
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
USE_POSTGRES = DATABASE_URL is not None

def get_db_connection():
    """Get database connection based on available database"""
    if USE_POSTGRES:
        try:
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            return conn, 'postgres'
        except Exception as e:
            print(f"PostgreSQL connection failed: {e}")
            print("Falling back to SQLite")

    # Fallback to SQLite
    conn = sqlite3.connect('library.db')
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite'

def init_database():
    """Initialize database tables"""
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        if db_type == 'postgres':
            # PostgreSQL table creation
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS books (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    author VARCHAR(255) NOT NULL,
                    tticode VARCHAR(100) UNIQUE NOT NULL,
                    isbn VARCHAR(20),
                    category VARCHAR(100) NOT NULL,
                    status VARCHAR(20) DEFAULT 'Available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS members (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    member_id VARCHAR(50) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    book_title VARCHAR(255) NOT NULL,
                    member_name VARCHAR(255) NOT NULL,
                    checkout_date DATE NOT NULL,
                    due_date DATE NOT NULL,
                    status VARCHAR(20) DEFAULT 'Checked Out',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
        else:
            # SQLite table creation
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    tticode TEXT UNIQUE NOT NULL,
                    isbn TEXT,
                    category TEXT NOT NULL,
                    status TEXT DEFAULT 'Available',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    member_id TEXT UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    book_title TEXT NOT NULL,
                    member_name TEXT NOT NULL,
                    checkout_date DATE NOT NULL,
                    due_date DATE NOT NULL,
                    status TEXT DEFAULT 'Checked Out',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

        conn.commit()
        print(f"Database initialized successfully using {db_type}")

    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# Routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Books API
@app.route('/api/books', methods=['GET'])
def get_books():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM books ORDER BY created_at DESC')
        books = [dict(row) for row in cursor.fetchall()]
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    tticode = data.get('ttiCode')
    isbn = data.get('isbn', '')
    category = data.get('category')

    if not all([title, author, tticode, category]):
        return jsonify({'error': 'Missing required fields'}), 400

    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        if db_type == 'postgres':
            cursor.execute('''
                INSERT INTO books (title, author, tticode, isbn, category) 
                VALUES (%s, %s, %s, %s, %s) RETURNING *
            ''', (title, author, tticode, isbn, category))
            book = dict(cursor.fetchone())
        else:
            cursor.execute('''
                INSERT INTO books (title, author, tticode, isbn, category) 
                VALUES (?, ?, ?, ?, ?)
            ''', (title, author, tticode, isbn, category))
            book_id = cursor.lastrowid
            cursor.execute('SELECT * FROM books WHERE id = ?', (book_id,))
            book = dict(cursor.fetchone())

        conn.commit()
        return jsonify(book)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Members API
@app.route('/api/members', methods=['GET'])
def get_members():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM members ORDER BY created_at DESC')
        members = [dict(row) for row in cursor.fetchall()]
        return jsonify(members)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/members', methods=['POST'])
def add_member():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    member_id = f"M{int(datetime.now().timestamp() * 1000)}"

    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        if db_type == 'postgres':
            cursor.execute('''
                INSERT INTO members (name, member_id) 
                VALUES (%s, %s) RETURNING *
            ''', (name, member_id))
            member = dict(cursor.fetchone())
        else:
            cursor.execute('''
                INSERT INTO members (name, member_id) 
                VALUES (?, ?)
            ''', (name, member_id))
            cursor.execute('SELECT * FROM members WHERE member_id = ?', (member_id,))
            member = dict(cursor.fetchone())

        conn.commit()
        return jsonify({'id': member['member_id']})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Transactions API
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM transactions ORDER BY created_at DESC')
        transactions = [dict(row) for row in cursor.fetchall()]
        return jsonify(transactions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    book_title = data.get('book_title')
    member_name = data.get('member_name')
    checkout_date = data.get('checkout_date')
    due_date = data.get('due_date')
    status = data.get('status', 'Checked Out')

    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        if db_type == 'postgres':
            cursor.execute('''
                INSERT INTO transactions (book_title, member_name, checkout_date, due_date, status) 
                VALUES (%s, %s, %s, %s, %s) RETURNING *
            ''', (book_title, member_name, checkout_date, due_date, status))
            transaction = dict(cursor.fetchone())
        else:
            cursor.execute('''
                INSERT INTO transactions (book_title, member_name, checkout_date, due_date, status) 
                VALUES (?, ?, ?, ?, ?)
            ''', (book_title, member_name, checkout_date, due_date, status))
            transaction_id = cursor.lastrowid
            cursor.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,))
            transaction = dict(cursor.fetchone())

        conn.commit()
        return jsonify(transaction)
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/transactions', methods=['DELETE'])
def clear_transactions():
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('DELETE FROM transactions')
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_database()
    print(f"Using database: {'PostgreSQL' if USE_POSTGRES else 'SQLite (library.db)'}")
    # Sample data
    sample_books = [
        {"title": "Fundamentals of Nursing", "author": "Patricia Potter", "ttiCode": "TTI001", "isbn": "9780323673587", "category": "Nursing", "status": "Available"},
        {"title": "Principles of Management", "author": "Stephen Robbins", "ttiCode": "TTI002", "isbn": "9780134486833", "category": "Business Administration", "status": "Available"},
        {"title": "Clinical Laboratory Science", "author": "Doig Kaplan", "ttiCode": "TTI003", "isbn": "9780323711234", "category": "Medical Laboratory Technician", "status": "Available"},
        {"title": "Yearbook Design Fundamentals", "author": "Sarah Mitchell", "ttiCode": "TTI016", "isbn": "9781234567890", "category": "Yearbook Publishing", "status": "Available"},
        {"title": "Digital Photography for Yearbooks", "author": "Robert Chen", "ttiCode": "TTI017", "isbn": "9781234567891", "category": "Yearbook Publishing", "status": "Available"}
    ]
    app.run(host='0.0.0.0', port=5000, debug=True)