// app/page.jsx
'use client'

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import stockList from './stockList';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  const filteredStocks = stockList.filter(stock =>
    stock.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToPortfolio = () => {
    if (!selectedStock) return;
    const exists = portfolio.some(item => item.symbol === selectedStock.symbol);
    if (!exists) {
      setPortfolio([...portfolio, { ...selectedStock, quantity: '', price: '' }]);
      setSearch('');
      setSelectedStock(null);
    }
  };

  const updatePortfolio = (symbol, field, value) => {
    setPortfolio(prev =>
      prev.map(item =>
        item.symbol === symbol ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex p-4 gap-6">
      <div className="w-1/2 space-y-4">
        <h1 className="text-2xl font-bold">Stock Selector</h1>
        <Input
          placeholder="Type stock name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white"
        />
        {search && (
          <div className="bg-zinc-800 rounded-md max-h-60 overflow-y-auto">
            {filteredStocks.slice(0, 10).map(stock => (
              <div
                key={stock.symbol}
                className="p-2 hover:bg-zinc-700 cursor-pointer"
                onClick={() => setSelectedStock(stock)}
              >
                {stock.name}
              </div>
            ))}
          </div>
        )}
        {selectedStock && (
          <div className="text-green-400">Selected: {selectedStock.name}</div>
        )}
        <Button onClick={addToPortfolio} className="bg-green-600 hover:bg-green-700">
          Add to Portfolio
        </Button>
      </div>

      <div className="w-1/2">
        <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
        <ScrollArea className="bg-zinc-900 rounded-xl p-4 space-y-4 max-h-[70vh]">
          {portfolio.map(stock => (
            <div key={stock.symbol} className="border border-zinc-700 p-4 rounded-lg">
              <div className="font-semibold text-lg mb-2">{stock.name}</div>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={stock.quantity}
                  onChange={e => updatePortfolio(stock.symbol, 'quantity', e.target.value)}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
                <Input
                  type="number"
                  placeholder="Buy Price"
                  value={stock.price}
                  onChange={e => updatePortfolio(stock.symbol, 'price', e.target.value)}
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
