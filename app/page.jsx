'use client'
import React, { useState } from 'react'

export default function Home() {
  const [portfolio, setPortfolio] = useState([])
  const [selectedStock, setSelectedStock] = useState('')

  const addStock = () => {
    if (selectedStock && !portfolio.find(stock => stock.name === selectedStock)) {
      setPortfolio([...portfolio, { name: selectedStock, quantity: '', price: '' }])
      setSelectedStock('')
    }
  }

  const updateField = (index, field, value) => {
    const updatedPortfolio = [...portfolio]
    updatedPortfolio[index][field] = value
    setPortfolio(updatedPortfolio)
  }

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <h1 style={styles.heading}>Add Stock</h1>
        <input
          type="text"
          placeholder="Enter NSE stock symbol"
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
          style={styles.input}
        />
        <button onClick={addStock} style={styles.button}>Add to Portfolio</button>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <h2 style={styles.heading}>Your Portfolio</h2>
        {portfolio.length === 0 && <p style={{ color: '#bbb' }}>No stocks added yet.</p>}
        {portfolio.map((stock, index) => (
          <div key={index} style={styles.stockRow}>
            <span style={styles.stockName}>{stock.name}</span>
            <input
              type="number"
              placeholder="Qty"
              value={stock.quantity}
              onChange={(e) => updateField(index, 'quantity', e.target.value)}
              style={styles.smallInput}
            />
            <input
              type="number"
              placeholder="Price"
              value={stock.price}
              onChange={(e) => updateField(index, 'price', e.target.value)}
              style={styles.smallInput}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#0d0d0d',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  leftPanel: {
    width: '40%',
    padding: '40px',
    borderRight: '2px solid #222',
    boxSizing: 'border-box',
  },
  rightPanel: {
    width: '60%',
    padding: '40px',
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#00ffcc',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#00cc99',
    border: 'none',
    borderRadius: '6px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  stockRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '16px',
    backgroundColor: '#111',
    padding: '12px',
    borderRadius: '8px',
  },
  stockName: {
    flex: 1,
    fontWeight: 'bold',
  },
  smallInput: {
    width: '80px',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #444',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
}

