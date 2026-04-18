import React, { useState } from 'react';
import './notes.css';

const Notes = ({ onBack }) => {

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState('');

  const handleToggle = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: newItem,
      completed: false
    };

    setItems([newEntry, ...items]);
    setNewItem('');
  };

  return (
    <div className="grocery_page">
      <header className="grocery_header">
        <button className="back_circle_btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="header_text">
          <h1 className='grocery_h1'>Grocery List</h1>
          <span>{items.filter(i => !i.completed).length} items left</span>
        </div>
      </header>

      {/* NEW INPUT (minimal, no design break) */}
      <div style={{ padding: '0 20px', marginBottom: '10px' }}>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            outline: 'none'
          }}
        />
      </div>

      <div className="grocery_content">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`grocery_card ${item.completed ? 'is_checked' : ''}`}
            onClick={() => handleToggle(item.id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="checkbox_ui">
              {item.completed && <div className="inner_check">✓</div>}
            </div>
            <span className="item_name">{item.text}</span>
          </div>
        ))}
      </div>

      {/* FIXED BUTTON */}
      <button className="fab_add" onClick={handleAddItem}>
        +
      </button>
    </div>
  );
};

export default Notes;