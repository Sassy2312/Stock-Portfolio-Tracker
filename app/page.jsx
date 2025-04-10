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

  const dropdownRef = useRef(null);

  const filteredStocks = stockOptions.filter(stock =>
    stock.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setTimeout(() => {
      setShowDropdown(e.target.value.length > 0);
    }, 10);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) => {
        const nextIndex = Math.min(prev + 1, filteredStocks.length - 1);
        scrollToItem(nextIndex);
        return nextIndex;
      });
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) => {
        const nextIndex = Math.max(prev - 1, 0);
        scrollToItem(nextIndex);
        return nextIndex;
      });
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredStocks[highlightedIndex]) {
        addStock(filteredStocks[highlightedIndex]);
      } else if (filteredStocks.length === 1) {
        addStock(filteredStocks[0]);
      }
    }
  };

  const scrollToItem = (index) => {
    if (dropdownRef.current) {
      const listItem = dropdownRef.current.children[index];
      if (listItem) listItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const addStock = (stock) => {
    if (!selectedStocks.find(s => s.value === stock.value)) {
      setSelectedStocks(prev => [...prev, { ...stock, quantity: '', price: '', currentPrice: 'Loading...' }]);
      fetchCurrentPrice(stock.value).then(price => {
        setSelectedStocks(prev =>
          prev.map(s =>
            s.value === stock.value ? { ...s, currentPrice: price } : s
          )
        );
      });
    }
    setSearch('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const fetchCurrentPrice = async (ticker) => {
    try {
      const response = await fetch(`${SHEET_URL}?ticker=${ticker}`);
      const data = await response.json();
      if (typeof data.price === 'string' || typeof data.price === 'number') {
        return data.price;
      } else {
        return 'N/A';
      }
    } catch (err) {
      console.error('Fetch price error for', ticker, err);
      return 'N/A';
    }
  };

  const removeStock = (value) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.value !== value));
  };

  const savePortfolio = async () => {
    if (!portfolioName || selectedStocks.length === 0) return;
    const payload = selectedStocks.map(stock => ({
      portfolioName,
      ticker: stock.value,
      quantity: stock.quantity,
      buyPrice: stock.price,
      currentPrice: stock.currentPrice
    }));

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      alert('✅ Portfolio saved!');
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const analyzePortfolio = () => {
    let totalInvested = 0;
    let totalCurrent = 0;

    selectedStocks.forEach(stock => {
      const qty = parseFloat(stock.quantity);
      const buy = parseFloat(stock.price);
      const curr = parseFloat(stock.currentPrice);

      if (!isNaN(qty) && !isNaN(buy)) totalInvested += qty * buy;
      if (!isNaN(qty) && !isNaN(curr)) totalCurrent += qty * curr;
    });

    const change = ((totalCurrent - totalInvested) / totalInvested) * 100;
    alert(`📊 Total Invested: ₹${totalInvested.toFixed(2)}\n💹 Current Value: ₹${totalCurrent.toFixed(2)}\n📈 % Change: ${change.toFixed(2)}%`);
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-[2fr_1.5fr] gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">📈 Add Stocks</h1>

          <input
            type="text"
            placeholder="Portfolio name"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 mb-3"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Start typing stock name..."
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          <AnimatePresence>
            {showDropdown && (
              <motion.ul
                ref={dropdownRef}
                className="bg-gray-900 border border-gray-700 mt-2 rounded max-h-64 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredStocks.map((stock, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 text-sm ${
                      highlightedIndex === index ? 'bg-blue-700' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => addStock(stock)}
                  >
                    <img
                      src={`https://assets.smallcase.com/logos/${stock.value.toLowerCase()}.png`}
                      alt="logo"
                      className="w-4 h-4 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/20x20?text=S';
                      }}
                    />
                    {stock.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">📋 Portfolio</h2>

          <div className="text-xs text-gray-400 grid grid-cols-4 gap-2 px-2 mb-2">
            <span>Name</span>
            <span>Qty</span>
            <span>Buy ₹</span>
            <span>Current</span>
          </div>

          {selectedStocks.length === 0 ? (
            <p className="text-gray-400">No stocks added yet.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
              {selectedStocks.map((stock, index) => (
                <div
                  key={stock.value}
                  className="bg-gray-800 p-2 rounded flex justify-between items-center relative group text-xs"
                >
                  <div className="grid grid-cols-4 gap-2 items-center w-full">
                    <a
                      href={`https://www.screener.in/company/${stock.value}/consolidated/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline truncate"
                    >
                      {stock.label.split('(')[0].trim()}
                    </a>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={stock.quantity}
                      onChange={(e) =>
                        setSelectedStocks((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, quantity: e.target.value } : s
                          )
                        )
                      }
                      className="w-full p-1 rounded bg-gray-700 text-white"
                    />
                    <input
                      type="number"
                      placeholder="₹ Price"
                      value={stock.price}
                      onChange={(e) =>
                        setSelectedStocks((prev) =>
                          prev.map((s, i) =>
                            i === index ? { ...s, price: e.target.value } : s
                          )
                        )
                      }
                      className="w-full p-1 rounded bg-gray-700 text-white"
                    />
                    <span className="text-green-400 text-center">{stock.currentPrice}</span>
                  </div>
                  <button
                    onClick={() => removeStock(stock.value)}
                    className="absolute top-1 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              className="w-1/2 py-2 text-center rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={savePortfolio}
            >
              💾 Save Portfolio
            </button>
            <button
              className="w-1/2 py-2 text-center rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
              onClick={analyzePortfolio}
            >
              📊 Analyze
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
