from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import base64
import io
import re
from datetime import datetime
from PIL import Image
import pytesseract

app = Flask(__name__)
CORS(app)

DATABASE = 'expenses.db'

# Configure Tesseract path (adjust based on your installation)
# For Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            merchant TEXT,
            amount REAL NOT NULL,
            category TEXT,
            description TEXT,
            receipt_image TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def extract_amount(text):
    """Extract dollar amount from text"""
    # Look for patterns like $XX.XX or XX.XX
    patterns = [
        r'\$\s*(\d+\.?\d*)',  # $45.67
        r'total[:\s]+\$?\s*(\d+\.?\d*)',  # Total: $45.67
        r'amount[:\s]+\$?\s*(\d+\.?\d*)',  # Amount: 45.67
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    
    # Fallback: find any number with decimal
    numbers = re.findall(r'\d+\.\d{2}', text)
    if numbers:
        return float(numbers[0])
    
    return 0.0

def extract_date(text):
    """Extract date from text"""
    # Look for date patterns
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # 05/14/2026 or 05-14-26
        r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # 2026-05-14
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            date_str = match.group(1)
            # Try to parse and format
            try:
                # Handle different formats
                for fmt in ['%m/%d/%Y', '%m-%d-%Y', '%Y-%m-%d', '%m/%d/%y']:
                    try:
                        dt = datetime.strptime(date_str, fmt)
                        return dt.strftime('%Y-%m-%d')
                    except:
                        continue
            except:
                pass
    
    # Default to today
    return datetime.now().strftime('%Y-%m-%d')

def extract_merchant(text):
    """Extract merchant name (usually first line)"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # Return first non-empty line, limit to 50 chars
        return lines[0][:50]
    return "Unknown Merchant"

def categorize_expense(text, merchant):
    """Auto-categorize based on keywords"""
    text_lower = (text + ' ' + merchant).lower()
    
    categories = {
        'Food': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'food', 'pizza', 'burger'],
        'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'transit'],
        'Accommodation': ['hotel', 'airbnb', 'motel', 'inn', 'resort'],
        'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'game', 'entertainment'],
        'Office Supplies': ['office', 'staples', 'supplies', 'paper', 'pen']
    }
    
    for category, keywords in categories.items():
        if any(keyword in text_lower for keyword in keywords):
            return category
    
    return 'Other'

@app.route('/api/ocr/process', methods=['POST'])
def process_receipt():
    """Process receipt image with OCR"""
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Extract information
        amount = extract_amount(text)
        date = extract_date(text)
        merchant = extract_merchant(text)
        category = categorize_expense(text, merchant)
        
        return jsonify({
            'success': True,
            'extracted_data': {
                'amount': amount,
                'date': date,
                'merchant': merchant,
                'category': category,
                'raw_text': text
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    conn = get_db_connection()
    expenses = conn.execute('SELECT * FROM expenses ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(expense) for expense in expenses])

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    """Create new expense"""
    data = request.json
    conn = get_db_connection()
    
    cursor = conn.execute('''
        INSERT INTO expenses (date, merchant, amount, category, description, receipt_image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['date'],
        data.get('merchant', ''),
        data['amount'],
        data.get('category', 'Other'),
        data.get('description', ''),
        data.get('receipt_image', ''),
        data.get('status', 'pending')
    ))
    
    expense_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'expense_id': expense_id,
        'message': 'Expense created successfully'
    }), 201

@app.route('/api/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    """Update expense"""
    data = request.json
    conn = get_db_connection()
    
    conn.execute('''
        UPDATE expenses 
        SET date = ?, merchant = ?, amount = ?, category = ?, description = ?, status = ?
        WHERE id = ?
    ''', (
        data['date'],
        data.get('merchant', ''),
        data['amount'],
        data.get('category', 'Other'),
        data.get('description', ''),
        data.get('status', 'pending'),
        id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Expense updated successfully'})

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    """Delete expense"""
    conn = get_db_connection()
    conn.execute('DELETE FROM expenses WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Expense deleted successfully'})

@app.route('/api/expenses/summary', methods=['GET'])
def get_summary():
    """Get expense summary"""
    conn = get_db_connection()
    
    total = conn.execute('SELECT SUM(amount) as total FROM expenses').fetchone()
    by_category = conn.execute('''
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM expenses
        GROUP BY category
    ''').fetchall()
    by_status = conn.execute('''
        SELECT status, COUNT(*) as count
        FROM expenses
        GROUP BY status
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        'total': total['total'] or 0,
        'by_category': [dict(row) for row in by_category],
        'by_status': [dict(row) for row in by_status]
    })

@app.route('/api/chat/message', methods=['POST'])
def chat_message():
    """Simulate BOB chat responses"""
    data = request.json
    message = data.get('message', '').lower()
    
    # Simple intent recognition
    if 'hello' in message or 'hi' in message:
        response = "Hello! I'm ReceiptBot 🚀. Send me a receipt photo and I'll extract the expense details for you!"
    elif 'help' in message:
        response = "I can help you:\n• Upload receipt photos\n• Extract expense details automatically\n• Track your expenses\n• Generate reports\n\nJust send me a receipt photo to get started!"
    elif 'status' in message or 'summary' in message:
        # Get summary
        conn = get_db_connection()
        total = conn.execute('SELECT SUM(amount) as total, COUNT(*) as count FROM expenses').fetchone()
        conn.close()
        response = f"📊 Your Expense Summary:\n• Total Expenses: ${total['total'] or 0:.2f}\n• Number of Expenses: {total['count'] or 0}"
    else:
        response = "I'm here to help! Send me a receipt photo or type 'help' for more options."
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    init_db()
    print("🚀 ReceiptBot Backend Starting...")
    print("📸 OCR Ready - Send receipt photos!")
    print("🤖 BOB Integration Active")
    print("⚙️  ICA Workflows Enabled")
    app.run(debug=True, port=5000)

# Made with Bob
