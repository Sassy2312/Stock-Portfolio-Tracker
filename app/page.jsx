'use client'
import { useState } from 'react'

const nseStocks = ["RELIANCE", "TCS", "INFY", "HDFC", "ICICIBANK", "SBIN", "WIPRO"]

export default function Home() {
  const [portfolio, setPortfolio] = useState([])
  const [selectedStock, setSelectedStock] = useState("")

  const addStock = () => {
    if (!selectedStock || portfolio.some(s => s.name === selectedStock)) return
    setPortfolio([...portfolio, { name: selectedStock, quantity: "", price: "" }])
    setSelectedStock("")
  }

  const updatePortfolio = (index, field, value) => {
    const updated = [...portfolio]
    updated[index][field] = value
    setPortfolio(updated)
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-5">📈 Stock Portfolio Tracker</h1>

      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="text-black p-2 rounded"
        >
          <option value="">-- Select Stock --</option>
          {nseStocks.map((stock) => (
            <option key={stock} value={stock}>
              {stock}
            </option>
          ))}
        </select>
        <button onClick={addStock} className="bg-green-600 px-4 py-2 rounded">
          Add to Portfolio
        </button>
      </div>

      <h2 className="text-2xl mb-4">🗂️ Portfolio</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-700">Name</th>
            <th className="p-2 border border-gray-700">Quantity</th>
            <th className="p-2 border border-gray-700">Price</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((stock, index) => (
            <tr key={index} className="bg-gray-900">
              <td className="p-2 border border-gray-700">{stock.name}</td>
              <td className="p-2 border border-gray-700">
                <input
                  type="number"
                  value={stock.quantity}
                  onChange={(e) => updatePortfolio(index, "quantity", e.target.value)}
                  className="text-black p-1 w-full"
                />
              </td>
              <td className="p-2 border border-gray-700">
                <input
                  type="number"
                  value={stock.price}
                  onChange={(e) => updatePortfolio(index, "price", e.target.value)}
                  className="text-black p-1 w-full"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
