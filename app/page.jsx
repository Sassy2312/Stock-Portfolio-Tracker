'use client';

import { useEffect, useRef, useState } from 'react';
import { stockOptions } from './stockList';
import { motion, AnimatePresence } from 'framer-motion';

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

  const addStock = (stock) => {
    if (!selectedStocks.find(s => s.value === stock.value)) {
      setSelectedStocks([...selectedStocks, { ...stock, quantity: '', price: '' }]);
    }
    setSearch('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeStock = (value) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.value !== value));
  };

  useEffect(() => {
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

    fetchIndexes();
    const interval = setInterval(fetchIndexes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-[2fr_1.5fr] gap-6">
        {/* LEFT PANEL */}
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
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${
                      highlightedIndex === index ? 'bg-blue-700' : 'hover:bg-gray-700'
                    }`}
                    onClick={() => addStock(stock)}
                  >
                    <img
                      src={`https://assets.smallcase.com/logos/${stock.value.toLowerCase()}.png`}
                      alt="logo"
                      className="w-5 h-5 rounded-full"
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

          {/* MARKET INDEXES */}
          <div className="mt-6 space-y-3">
            {marketIndexes.map((index) => (
              <div
                key={index.name}
                className="bg-gray-800 px-4 py-2 rounded flex justify-between items-center"
              >
                <span>{index.name}</span>
                <span>
                  {index.value}{' '}
                  <span className={
                    index.change.startsWith('-') ? 'text-red-400' : 'text-green-400'
                  }>
                    ({index.change})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div>
          <h2 className="text-3xl font-bold mb-4">📋 Portfolio</h2>
          {selectedStocks.length === 0 ? (
            <p className="text-gray-400">No stocks added yet.</p>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[90vh] pr-2">
              {selectedStocks.map((stock, index) => (
                <div
                  key={stock.value}
                  className="bg-gray-800 p-4 rounded flex justify-between items-center relative group"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <img
                        src={`https://assets.smallcase.com/logos/${stock.value.toLowerCase()}.png`}
                        alt="logo"
                        className="w-5 h-5 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/20x20?text=S';
                        }}
                      />
                      {stock.label}
                    </p>
                    <div className="flex gap-4 mt-2">
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
                        className="w-20 p-1 rounded bg-gray-700 text-white"
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
                        className="w-24 p-1 rounded bg-gray-700 text-white"
                      />
                    </div>
                  </div>

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => removeStock(stock.value)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
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
