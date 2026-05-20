import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "🚀 Welcome to ReceiptRocket!\n\nI'm your AI-powered expense assistant. Just upload a receipt photo and I'll extract all the details automatically!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, by_category: [] });
  const [showExpenses, setShowExpenses] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    addMessage('user', userMessage);

    try {
      const response = await axios.post(`${API_URL}/chat/message`, {
        message: userMessage
      });
      
      setTimeout(() => {
        addMessage('bot', response.data.response);
        
        if (userMessage.toLowerCase().includes('status') || 
            userMessage.toLowerCase().includes('summary')) {
          setShowExpenses(true);
        }
      }, 500);
    } catch (error) {
      addMessage('bot', 'Sorry, I encountered an error. Please try again.');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    addMessage('user', '📸 [Receipt Photo Uploaded]');
    addMessage('bot', '⏳ Processing your receipt... This will take a few seconds.');
    
    setIsProcessing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        try {
          const response = await axios.post(`${API_URL}/ocr/process`, {
            image: base64Image
          });

          const data = response.data.extracted_data;
          setExtractedData(data);
          setIsConfirming(true);
          
          addMessage('bot', 
            `✅ Receipt processed successfully!\n\n` +
            `📄 Extracted Details:\n` +
            `💰 Amount: $${data.amount.toFixed(2)}\n` +
            `📅 Date: ${data.date}\n` +
            `🏪 Merchant: ${data.merchant}\n` +
            `📂 Category: ${data.category}\n\n` +
            `Is this information correct?`
          );
          
          setIsProcessing(false);
        } catch (error) {
          addMessage('bot', '❌ Sorry, I couldn\'t process that receipt. Please make sure the image is clear and try again.');
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      addMessage('bot', '❌ Error uploading image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleConfirmExpense = async () => {
    if (!extractedData) return;

    addMessage('user', '✅ Yes, submit this expense');
    addMessage('bot', '⏳ Submitting expense...');

    try {
      const response = await axios.post(`${API_URL}/expenses`, {
        date: extractedData.date,
        merchant: extractedData.merchant,
        amount: extractedData.amount,
        category: extractedData.category,
        description: `Auto-extracted from receipt`,
        status: 'approved'
      });

      addMessage('bot', 
        `🎉 Expense submitted successfully!\n\n` +
        `📋 Expense ID: EXP-${response.data.expense_id.toString().padStart(6, '0')}\n` +
        `💰 Amount: $${extractedData.amount.toFixed(2)}\n` +
        `✅ Status: Approved\n\n` +
        `Your expense has been automatically approved and added to your records!`
      );

      setExtractedData(null);
      setIsConfirming(false);
      fetchExpenses();
      fetchSummary();
    } catch (error) {
      addMessage('bot', '❌ Error submitting expense. Please try again.');
    }
  };

  const handleRejectExpense = () => {
    addMessage('user', '❌ No, let me upload a different receipt');
    addMessage('bot', 'No problem! Please upload a new receipt photo and I\'ll process it for you.');
    setExtractedData(null);
    setIsConfirming(false);
  };

  const handleEditExpense = () => {
    addMessage('user', '✏️ I want to edit the details');
    addMessage('bot', 'Sure! What would you like to change? You can type the corrections or upload a clearer photo.');
    setIsConfirming(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 ReceiptRocket</h1>
          <p>AI-Powered Expense Assistant for Bob-a-thon31</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">${summary.total.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Submissions</span>
            <span className="stat-value">{expenses.length}</span>
          </div>
        </div>
      </header>

      <div className="main-container">
        <div className="chat-section">
          <div className="chat-header">
            <h2>💬 Chat with BOB</h2>
            <span className="status-indicator">🟢 Online</span>
          </div>
          
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isConfirming && (
              <div className="confirmation-buttons">
                <button onClick={handleConfirmExpense} className="btn-confirm">
                  ✅ Yes, Submit
                </button>
                <button onClick={handleEditExpense} className="btn-edit">
                  ✏️ Edit Details
                </button>
                <button onClick={handleRejectExpense} className="btn-reject">
                  ❌ Upload New Photo
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="input-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="btn-upload"
              disabled={isProcessing}
            >
              📸 Upload Receipt
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message or upload a receipt..."
              className="message-input"
              disabled={isProcessing}
            />
            <button 
              onClick={handleSendMessage}
              className="btn-send"
              disabled={isProcessing || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </div>

        {showExpenses && (
          <div className="expenses-panel">
            <div className="panel-header">
              <h2>📊 Expense History</h2>
              <button onClick={() => setShowExpenses(false)} className="btn-close">
                ✕
              </button>
            </div>
            
            <div className="summary-cards">
              {summary.by_category.map((cat, index) => (
                <div key={index} className="category-card">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-amount">${cat.total.toFixed(2)}</span>
                  <span className="category-count">{cat.count} expenses</span>
                </div>
              ))}
            </div>

            <div className="expenses-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-header">
                    <span className="expense-merchant">{expense.merchant}</span>
                    <span className={`expense-status status-${expense.status}`}>
                      {expense.status}
                    </span>
                  </div>
                  <div className="expense-details">
                    <span className="expense-date">{expense.date}</span>
                    <span className="expense-category">{expense.category}</span>
                  </div>
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Powered by IBM BOB + ICA | Bob-a-thon31 2026</p>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
