import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyJY2reiFApdYtxDaH6SOhbBimujyzn_Y0A-x_-sr7ecPuK9j45P072ZCFO4PiHjpD-/exec';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#8884d8', '#82ca9d'];

export default function Page() {
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolio, setPortfolio] = useState([{ stock: '', quantity: '', buyPrice: '' }]);
  const [prices, setPrices] = useState({});
  const [analyze, setAnalyze] = useState(false);

  useEffect(() => {
    fetchPrices();
    fetchSavedPortfolios();
  }, []);

  const fetchPrices = async () => {
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        const priceMap = {};
        data.forEach(row => {
          const ticker = row[0]?.trim().toUpperCase();
          priceMap[ticker] = {
            currentPrice: parseFloat(row[1]),
            pe: row[2],
            marketCap: row[3],
            eps: row[4],
            weekHigh: row[5],
            weekLow: row[6],
            dayChange: row[7],
            volume: row[8],
          };
        });
        setPrices(priceMap);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  };

  const fetchSavedPortfolios = async () => {
    // In actual implementation, fetch saved portfolio names
    // Here, simulate saved portfolio dropdown
    const saved = localStorage.getItem('savedPortfolios');
    if (saved) {
      setPortfolioList(JSON.parse(saved));
    }
  };

  const updatePortfolio = (index, key, value) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index][key] = value;
    setPortfolio(newPortfolio);
  };

  const addRow = () => {
    setPortfolio([...portfolio, { stock: '', quantity: '', buyPrice: '' }]);
  };

  const calcProfit = (stock) => {
    const p = prices[stock.toUpperCase()];
    return p ? parseFloat(p.currentPrice) : 0;
  };

  const portfolioData = portfolio.map(entry => {
    const stock = entry.stock.trim().toUpperCase();
    const qty = parseFloat(entry.quantity);
    const buy = parseFloat(entry.buyPrice);
    const live = calcProfit(stock);
    const invested = qty * buy;
    const current = qty * live;
    return {
      stock,
      quantity: qty,
      buyPrice: buy,
      invested,
      current,
      profit: current - invested,
      change: invested > 0 ? ((current - invested) / invested) * 100 : 0,
      currentPrice: live,
    };
  });

  const totalInvested = portfolioData.reduce((sum, row) => sum + row.invested, 0);
  const totalCurrent = portfolioData.reduce((sum, row) => sum + row.current, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalChange = (totalProfit / totalInvested) * 100;

  const savePortfolio = async () => {
    if (!portfolioName.trim()) {
      alert('Please enter a portfolio name to save.');
      return;
    }
    const payload = portfolioData.map(p => ({
      portfolioName,
      ticker: p.stock,
      quantity: p.quantity,
      buyPrice: p.buyPrice,
      currentPrice: p.currentPrice,
      invested: p.invested,
      profit: p.profit,
      changePercent: p.change
    }));

    try {
      const res = await fetch(SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await res.text();
      alert(text);
    } catch (err) {
      alert('Failed to save portfolio');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💼 Stellar Portfolio Dashboard</h1>

      <div className="mb-4">
        <label className="mr-2 font-medium">Portfolio Name:</label>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => setPortfolioName(e.target.value)}
          className="border p-2 rounded w-64"
          placeholder="My Portfolio"
        />
        <button
          onClick={savePortfolio}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          💾 Save Portfolio
        </button>
        <button
          onClick={() => setAnalyze(true)}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📊 Analyze Portfolio
        </button>
      </div>

      {!analyze && (
        <div>
          {portfolio.map((entry, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-2">
              <input
                className="border p-2 rounded"
                placeholder="Ticker (e.g. CAMS)"
                value={entry.stock}
                onChange={(e) => updatePortfolio(index, 'stock', e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                className="border p-2 rounded"
                value={entry.quantity}
                onChange={(e) => updatePortfolio(index, 'quantity', e.target.value)}
              />
              <input
                type="number"
                placeholder="Buy Price"
                className="border p-2 rounded"
                value={entry.buyPrice}
                onChange={(e) => updatePortfolio(index, 'buyPrice', e.target.value)}
              />
            </div>
          ))}
          <button
            onClick={addRow}
            className="mt-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >+ Add Stock</button>
        </div>
      )}

      {analyze && (
        <div>
          <button onClick={() => setAnalyze(false)} className="mb-4 bg-gray-600 text-white px-3 py-2 rounded">← Back</button>
          <h2 className="text-xl font-semibold mb-2">Portfolio Summary: {portfolioName || 'Untitled'}</h2>
          <div className={`mb-4 text-lg font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Invested: ₹{totalInvested.toFixed(2)} | Current: ₹{totalCurrent.toFixed(2)} | Net Change: {totalChange.toFixed(2)}%
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={portfolioData} dataKey="current" nameKey="stock" cx="50%" cy="50%" outerRadius={100}>
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portfolioData}>
                <XAxis dataKey="stock" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="mt-6 w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2">Stock</th>
                <th className="border px-2">Invested</th>
                <th className="border px-2">Current</th>
                <th className="border px-2">Profit</th>
                <th className="border px-2">% Change</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((row, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-2">{row.stock}</td>
                  <td className="border px-2">₹{row.invested.toFixed(2)}</td>
                  <td className="border px-2">₹{row.current.toFixed(2)}</td>
                  <td className={`border px-2 ${row.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{row.profit.toFixed(2)}</td>
                  <td className={`border px-2 ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{row.change.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
