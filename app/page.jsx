'use client';

import { useEffect, useRef, useState } from 'react';
import { stockOptions } from './stockList';
import { motion, AnimatePresence } from 'framer-motion';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWF99ycQ93t9y7ErTf0KJqocI-7n9mOW6yT1uB7CLtIhDeUM1zqL2cPVPKfMCUcAzz/exec';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [marketIndexes, setMarketIndexes] = useState([
    { name: 'Nifty', value: '-', change: '-' },
    { name: 'Bank Nifty', value: '-', change: '-' },
    { name: 'Sensex', value: '-', change: '-' },
  ]);
  const [priceMap, setPriceMap] = useState({});
  const [analysis, setAnalysis] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPricesFromAppsScript();
    fetchIndexes();
  }, []);

  const fetchPricesFromAppsScript = async () => {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const json = await res.json();
      setPriceMap(json);
    } catch (err) {
      console.error('Apps Script fetch error:', err);
    }
  };

  const fetchIndexes = async () => {
    const indexSymbols = [
      { name: 'Nifty', value: '22500.00', change: '+0.10%' },
      { name: 'Bank Nifty', value: '48200.00', change: '+0.05%' },
      { name: 'Sensex', value: '75100.00', change: '-0.15%' },
    ];
    setMarketIndexes(indexSymbols);
  };

  const filteredStocks = stockOptions.filter(stock =>
    stock.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setShowDropdown(e.target.value.length > 0);
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

  const scrollToItem = (index) => {
    if (dropdownRef.current) {
      const listItem = dropdownRef.current.children[index];
      if (listItem) listItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const addStock = (stock) => {
    if (selectedStocks.find(s => s.value === stock.value)) return;
    const price = priceMap[stock.value] ?? 'N/A';
    setSelectedStocks(prev => [...prev, { ...stock, quantity: '', price: '', currentPrice: price }]);
    setSearch('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeStock = (value) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.value !== value));
  };

  const analyzePortfolio = () => {
    let totalInvested = 0;
    let currentValue = 0;

    selectedStocks.forEach(stock => {
      const qty = parseFloat(stock.quantity);
      const buyPrice = parseFloat(stock.price);
      const currentPrice = parseFloat(stock.currentPrice);

      if (!isNaN(qty) && !isNaN(buyPrice) && !isNaN(currentPrice)) {
        totalInvested += qty * buyPrice;
        currentValue += qty * currentPrice;
      }
    });

    const profit = currentValue - totalInvested;
    const percent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    setAnalysis({ totalInvested, currentValue, profit, percent });
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_2fr_1.5fr] gap-6">
        <div className="space-y-4">
          {marketIndexes.map((index) => (
            <div
              key={index.name}
              className="bg-gray-800 w-28 h-28 flex flex-col items-center justify-center rounded shadow-md"
            >
              <span className="text-sm font-semibold">{index.name}</span>
              <span className="text-xl">{index.value}</span>
              <span
                className={`text-sm ${index.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}
              >
                {index.change}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">📈 Add Stocks</h1>
          <input
            type="text"
            placeholder="Start typing stock name..."
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none"
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

          <button
            onClick={analyzePortfolio}
            className="mb-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            🔍 Analyze Portfolio
          </button>

          {analysis && (
            <div className="bg-gray-800 p-3 rounded mb-4 text-sm">
              <div>Total Invested: ₹{analysis.totalInvested.toFixed(2)}</div>
              <div>Current Value: ₹{analysis.currentValue.toFixed(2)}</div>
              <div className={analysis.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                Profit/Loss: ₹{analysis.profit.toFixed(2)} ({analysis.percent.toFixed(2)}%)
              </div>
            </div>
          )}

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
        </div>
      </div>
    </main>
  );
}
