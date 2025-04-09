'use client';

import { useEffect, useRef, useState } from 'react';
import { stockOptions } from './stockList';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = '7ed5bc44f1b04fd2bf2864cd9b46ee65';

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

  const dropdownRef = useRef(null);

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

  const addStock = async (stock) => {
    if (!selectedStocks.find(s => s.value === stock.value)) {
      setSelectedStocks(prev => [...prev, { ...stock, quantity: '', price: '', currentPrice: '-' }]);
    }
    setSearch('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeStock = (value) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.value !== value));
  };

  const fetchAllPrices = async () => {
    if (selectedStocks.length === 0) return;
    const symbols = selectedStocks.map(s => `${s.value}.NSE`).join(',');
    try {
      const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbols}&apikey=${API_KEY}`);
      const data = await response.json();
      const updated = selectedStocks.map(stock => ({
        ...stock,
        currentPrice: data[`${stock.value}.NSE`]?.price || 'N/A'
      }));
      setSelectedStocks(updated);
    } catch (error) {
      console.error('Batch price fetch error:', error);
    }
  };

  const fetchIndexes = async () => {
    try {
      const randomize = (base) => {
        const val = base + (Math.random() - 0.5) * 100;
        const percent = ((Math.random() - 0.5) * 2).toFixed(2);
        return [val.toFixed(2), percent];
      };
      const [nifty, niftyChange] = randomize(22500);
      const [bankNifty, bankChange] = randomize(48200);
      const [sensex, sensexChange] = randomize(75100);

      setMarketIndexes([
        { name: 'Nifty', value: nifty, change: `${niftyChange}%` },
        { name: 'Bank Nifty', value: bankNifty, change: `${bankChange}%` },
        { name: 'Sensex', value: sensex, change: `${sensexChange}%` },
      ]);
    } catch (error) {
      console.error('Error fetching indexes', error);
    }
  };

  const fetchEverything = async () => {
    await fetchAllPrices();
    await fetchIndexes();
  };

  useEffect(() => {
    fetchIndexes();
    const interval = setInterval(fetchIndexes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_2fr_1.5fr] gap-6">
        {/* MARKET INDEX COLUMN */}
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

        {/* STOCK INPUT PANEL */}
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

        {/* PORTFOLIO PANEL */}
        <div>
          <h2 className="text-3xl font-bold mb-2">📋 Portfolio</h2>

          {/* Portfolio Header */}
          <div className="text-xs text-gray-400 grid grid-cols-4 gap-2 px-2 mb-2">
            <span>Name</span>
            <span>Qty</span>
            <span>Buy ₹</span>
            <span>Current</span>
          </div>

          {selectedStocks.length === 0 ? (
            <p className="text-gray-400">No stocks added yet.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-2">
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
              className="w-1/2 py-2 text-center rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
              onClick={fetchEverything}
            >
              🔄 Fetch Current Prices
            </button>
            <button
              className="w-1/2 py-2 text-center rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => alert('Portfolio analysis coming soon...')}
            >
              🔍 Analyze
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
