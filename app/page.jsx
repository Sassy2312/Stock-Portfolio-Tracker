"use client";

import { useState } from "react";
import stockList from "./stockList"; // Make sure this file exists
import { motion } from "framer-motion";

export default function Home() {
  const [query, setQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = (value) => {
    setQuery(value);
    if (value.length > 0) {
      const results = stockList.filter((stock) =>
        stock.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredStocks(results.slice(0, 10)); // limit to 10
    } else {
      setFilteredStocks([]);
    }
  };

  const handleAddToPortfolio = () => {
    if (!selectedStock || !quantity || !price) return;
    const newEntry = {
      ...selectedStock,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    };
    setPortfolio([...portfolio, newEntry]);
    setSelectedStock(null);
    setQuantity("");
    setPrice("");
    setQuery("");
    setFilteredStocks([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">📈 NSE Portfolio Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="bg-gray-950 p-6 rounded-2xl shadow-lg border border-gray-800">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search stock name..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 rounded-md text-black focus:outline-none"
            />
            {filteredStocks.length > 0 && (
              <div className="mt-2 bg-white text-black rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.ticker}
                    onClick={() => {
                      setSelectedStock(stock);
                      setQuery(stock.name);
                      setFilteredStocks([]);
                    }}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {stock.name} ({stock.ticker})
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-4 rounded-md mb-4"
            >
              <p className="text-lg font-semibold">{selectedStock.name}</p>
              <p className="text-sm text-gray-400">{selectedStock.ticker}</p>

              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 rounded mb-2 text-black"
                />
                <input
                  type="number"
                  placeholder="Buy Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 rounded text-black"
                />
              </div>

              <button
                onClick={handleAddToPortfolio}
                className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
              >
                ➕ Add to Portfolio
              </button>
            </motion.div>
          )}
        </div>

        {/* Right Panel */}
        <div className="bg-gray-950 p-6 rounded-2xl shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">📊 Portfolio</h2>
          {portfolio.length === 0 ? (
            <p className="text-gray-400">No stocks added yet.</p>
          ) : (
            <ul className="space-y-4">
              {portfolio.map((stock, index) => (
                <li key={index} className="bg-gray-800 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{stock.name}</p>
                      <p className="text-sm text-gray-400">{stock.ticker}</p>
                    </div>
                    <div className="text-right">
                      <p>Qty: {stock.quantity}</p>
                      <p>Price: ₹{stock.price}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
