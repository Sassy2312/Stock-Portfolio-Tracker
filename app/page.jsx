'use client';

import { useState } from 'react';
import { stockList } from '../stockList';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const [input, setInput] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowDropdown(value.length > 0);
  };

  const handleKeyDown = (e) => {
    const filtered = stockList.filter(
      (stock) => stock.toLowerCase().includes(input.toLowerCase())
    );

    if (e.key === 'Enter' && filtered.length === 1) {
      addStock(filtered[0]);
    }
  };

  const addStock = (stock) => {
    if (!selectedStocks.includes(stock)) {
      setSelectedStocks([...selectedStocks, stock]);
    }
    setInput('');
    setShowDropdown(false);
  };

  const removeStock = (stock) => {
    setSelectedStocks(selectedStocks.filter((s) => s !== stock));
  };

  const marketIndexes = [
    { name: 'Nifty', value: '22,500', change: '+0.45%' },
    { name: 'Bank Nifty', value: '48,200', change: '+0.33%' },
    { name: 'Sensex', value: '75,100', change: '+0.51%' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Stock Portfolio Tracker</h1>

      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Search and add stock..."
          className="w-full px-4 py-2 text-black rounded mb-2"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <AnimatePresence>
          {showDropdown && (
            <motion.ul
              className="bg-white text-black rounded shadow-md overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {stockList
                .filter((stock) =>
                  stock.toLowerCase().includes(input.toLowerCase())
                )
                .map((stock) => (
                  <li
                    key={stock}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => addStock(stock)}
                  >
                    {stock}
                  </li>
                ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 mt-4">
          {selectedStocks.map((stock) => (
            <div
              key={stock}
              className="bg-blue-700 px-3 py-1 rounded-full flex items-center group relative"
            >
              {stock}
              <button
                onClick={() => removeStock(stock)}
                className="ml-2 text-sm text-white opacity-0 group-hover:opacity-100 absolute top-[-8px] right-[-8px] bg-red-500 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          {marketIndexes.map(({ name, value, change }) => (
            <div key={name} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
              <span>{name}</span>
              <span>{value} <span className="text-green-400">({change})</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
