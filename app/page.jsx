'use client';

import { useEffect, useRef, useState } from 'react';
import { stockOptions } from './stockList';
import { motion, AnimatePresence } from 'framer-motion';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyJY2reiFApdYtxDaH6SOhbBimujyzn_Y0A-x_-sr7ecPuK9j45P072ZCFO4PiHjpD-/exec';

export default function Home() {
  const [search, setSearch] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [analysis, setAnalysis] = useState(null);
  const [priceMap, setPriceMap] = useState({});
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const dropdownRef = useRef(null);
  const lastStockRef = useRef(null);

  const filteredStocks = stockOptions.filter(stock =>
    stock.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        const res = await fetch(SHEET_URL);
        const data = await res.json();
        setPriceMap(data);
      } catch (err) {
        console.error('Error fetching price map:', err);
      }
    };
    fetchAllPrices();
  }, []);

  useEffect(() => {
    if (lastStockRef.current) {
      lastStockRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [selectedStocks]);

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setTimeout(() => setShowDropdown(e.target.value.length > 0), 10);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(prev => Math.min(prev + 1, filteredStocks.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredStocks[highlightedIndex]) {
        addStock(filteredStocks[highlightedIndex]);
      } else if (filteredStocks.length === 1) {
        addStock(filteredStocks[0]);
      }
    }
  };

  const addStock = async (stock) => {
    if (!selectedStocks.find(s => s.value === stock.value)) {
      const price = priceMap[stock.value] || 'N/A';
      setSelectedStocks(prev => [...prev, {
        ...stock,
        quantity: '',
        price: '',
        currentPrice: price
      }]);
    }
    setSearch('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeStock = (value) => {
    setSelectedStocks(prev => prev.filter(stock => stock.value !== value));
  };

  const savePortfolio = async () => {
    if (!portfolioName.trim()) {
      setMessage('⚠️ Please enter a portfolio name.');
      return;
    }
    if (selectedStocks.length === 0) {
      setMessage('⚠️ Add at least one stock to save.');
      return;
    }

    const payload = selectedStocks.map(stock => {
      const qty = parseFloat(stock.quantity);
      const buy = parseFloat(stock.price);
      const curr = parseFloat(stock.currentPrice);
      const invested = !isNaN(qty) && !isNaN(buy) ? qty * buy : 0;
      const current = !isNaN(qty) && !isNaN(curr) ? qty * curr : 0;
      const profit = current - invested;
      const changePercent = invested ? (profit / invested) * 100 : 0;
      return {
        portfolioName: portfolioName.trim(),
        ticker: stock.value,
        quantity: String(stock.quantity),
        buyPrice: String(stock.price),
        currentPrice: String(stock.currentPrice),
        invested: invested.toFixed(2),
        profit: profit.toFixed(2),
        changePercent: changePercent.toFixed(2)
      };
    });

    try {
      setIsSaving(true);
      setMessage('💾 Saving portfolio...');
      const res = await fetch(SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await res.text();
      setMessage(text.includes('✅') ? '✅ Portfolio saved successfully!' : '❌ Save failed.');
    } catch (err) {
      setMessage('❌ Failed to save portfolio.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const analyzePortfolio = () => {
    setIsAnalyzing(true);
    let totalInvested = 0, totalCurrent = 0;
    const details = selectedStocks.map(stock => {
      const qty = parseFloat(stock.quantity);
      const buy = parseFloat(stock.price);
      const curr = parseFloat(stock.currentPrice);
      const invested = !isNaN(qty) && !isNaN(buy) ? qty * buy : 0;
      const current = !isNaN(qty) && !isNaN(curr) ? qty * curr : 0;
      totalInvested += invested;
      totalCurrent += current;
      return {
        ...stock,
        invested,
        current,
        profit: current - invested,
        change: invested ? ((current - invested) / invested) * 100 : 0
      };
    });
    setAnalysis({ totalInvested, totalCurrent, details });
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">📊 Portfolio Tracker</h1>
      <input
        type="text"
        value={portfolioName}
        onChange={(e) => setPortfolioName(e.target.value)}
        placeholder="Portfolio Name"
        className="bg-gray-800 px-4 py-2 rounded mb-3 w-full"
      />
      <input
        type="text"
        placeholder="Search stock..."
        value={search}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="bg-gray-800 px-4 py-2 rounded w-full"
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            className="bg-gray-900 mt-1 rounded overflow-y-auto max-h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredStocks.map((stock, index) => (
              <li
                key={index}
                className={`px-4 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                onClick={() => addStock(stock)}
              >
                {stock.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-4">
        {selectedStocks.map((stock, index) => (
          <div key={stock.value} className="flex gap-2 items-center mb-2">
            <span className="w-32 truncate">{stock.label}</span>
            <input
              type="number"
              value={stock.quantity}
              onChange={(e) => {
                const updated = [...selectedStocks];
                updated[index].quantity = e.target.value;
                setSelectedStocks(updated);
              }}
              placeholder="Qty"
              className="bg-gray-700 px-2 py-1 rounded w-20"
            />
            <input
              type="number"
              value={stock.price}
              onChange={(e) => {
                const updated = [...selectedStocks];
                updated[index].price = e.target.value;
                setSelectedStocks(updated);
              }}
              placeholder="Buy ₹"
              className="bg-gray-700 px-2 py-1 rounded w-24"
            />
            <span className="w-20">@ ₹{stock.currentPrice}</span>
            <button
              onClick={() => removeStock(stock.value)}
              className="text-red-400 ml-2"
            >❌</button>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={savePortfolio}
          className="bg-green-600 px-4 py-2 rounded disabled:opacity-50"
          disabled={isSaving}
        >{isSaving ? 'Saving...' : '💾 Save Portfolio'}</button>

        <button
          onClick={analyzePortfolio}
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
          disabled={isAnalyzing}
        >{isAnalyzing ? 'Analyzing...' : '📈 Analyze'}</button>
      </div>

      {message && <p className="mt-4 text-sm text-yellow-300">{message}</p>}

      {analysis && (
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
          <p>Total Invested: ₹{analysis.totalInvested.toFixed(2)}</p>
          <p>Current Value: ₹{analysis.totalCurrent.toFixed(2)}</p>
          <p className={analysis.totalCurrent >= analysis.totalInvested ? 'text-green-400' : 'text-red-400'}>
            Change: {(100 * (analysis.totalCurrent - analysis.totalInvested) / analysis.totalInvested).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
