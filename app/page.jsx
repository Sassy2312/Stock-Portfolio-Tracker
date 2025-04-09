'use client'

import { useState } from 'react'
import { stockOptions } from './stockList'
import { motion } from 'framer-motion'

export default function Home() {
  const [search, setSearch] = useState('')
  const [portfolio, setPortfolio] = useState([])

  const filteredStocks = stockOptions.filter(stock =>
    stock.label.toLowerCase().includes(search.toLowerCase())
  )

  const addToPortfolio = (stock) => {
    if (!portfolio.find(item => item.value === stock.value)) {
      setPortfolio([...portfolio, { ...stock, quantity: '', price: '' }])
    }
    setSearch('')
  }

  const updateStock = (index, field, value) => {
    const updated = [...portfolio]
    updated[index][field] = value
    setPortfolio(updated)
  }

  return (
    <main className="min-h-screen flex bg-black text-white">
      {/* LEFT PANEL */}
      <div className="w-1/2 p-10 border-r border-gray-700">
        <h1 className="text-3xl font-bold mb-6">📈 Add Stocks</h1>
        <input
          type="text"
          placeholder="Type to search stocks..."
          className="w-full p-3 rounded bg-gray-800 border border-gray-600 mb-3 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="bg-gray-800 rounded max-h-64 overflow-y-auto border border-gray-600">
          {filteredStocks.map((stock, i) => (
            <div
              key={i}
              onClick={() => addToPortfolio(stock)}
              className="px-4 py-2 hover:bg-blue-700 cursor-pointer"
            >
              {stock.label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 p-10">
        <h2 className="text-3xl font-bold mb-6">📋 Portfolio</h2>
        {portfolio.length === 0 && (
          <p className="text-gray-400">No stocks added yet.</p>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="pb-2">Stock</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((stock, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-2">{stock.label}</td>
                <td className="py-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    className="w-20 p-1 rounded bg-gray-700 text-white"
                    value={stock.quantity}
                    onChange={(e) =>
                      updateStock(index, 'quantity', e.target.value)
                    }
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    placeholder="₹ Price"
                    className="w-24 p-1 rounded bg-gray-700 text-white"
                    value={stock.price}
                    onChange={(e) =>
                      updateStock(index, 'price', e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
