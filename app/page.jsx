'use client'

import { useState } from 'react'
import stockList from './stockList'
import { motion } from 'framer-motion'

export default function Home() {
  const [selectedStock, setSelectedStock] = useState('')
  const [search, setSearch] = useState('')

  const filteredStocks = stockList.filter(
    stock =>
      stock.name.toLowerCase().includes(search.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-black text-white p-6">
      <motion.h1
        className="text-4xl font-bold mb-8 mt-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Stock Portfolio Tracker
      </motion.h1>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <input
          type="text"
          placeholder="Search stock by name or symbol..."
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock, index) => (
              <div
                key={index}
                onClick={() => setSelectedStock(`${stock.name} (${stock.symbol})`)}
                className="p-3 hover:bg-blue-700 cursor-pointer transition duration-200"
              >
                {stock.name} ({stock.symbol})
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-400">No matching stocks found.</div>
          )}
        </div>

        {selectedStock && (
          <motion.div
            className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium">You selected:</p>
            <p className="text-xl font-semibold text-blue-400">{selectedStock}</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
