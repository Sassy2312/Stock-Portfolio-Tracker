import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import axios from "axios";

export default function PortfolioPage() {
  const [stocks, setStocks] = useState([
    { name: "RELIANCE", quantity: 10, avgPrice: 2400 },
    { name: "TCS", quantity: 5, avgPrice: 3400 },
  ]);
  const [stockSearch, setStockSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState(stocks);
  const [analyzed, setAnalyzed] = useState(false);
  const [stockData, setStockData] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [newStock, setNewStock] = useState({ name: "", quantity: "", avgPrice: "" });

  useEffect(() => {
    setFilteredStocks(
      stocks.filter((stock) =>
        stock.name.toLowerCase().includes(stockSearch.toLowerCase())
      )
    );
  }, [stockSearch, stocks]);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post("/api/get-stock-data", {
        stocks,
      });
      setStockData(response.data);
      setAnalyzed(true);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        "https://script.google.com/macros/s/AKfycbyJY2reiFApdYtxDaH6SOhbBimujyzn_Y0A-x_-sr7ecPuK9j45P072ZCFO4PiHjpD-/exec",
        JSON.stringify({ stocks }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Portfolio saved successfully!");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert("Failed to save portfolio");
    }
  };

  const sortStocks = (key) => {
    const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    const sorted = [...filteredStocks].sort((a, b) => {
      const valA = typeof a[key] === "string" ? a[key].toLowerCase() : a[key];
      const valB = typeof b[key] === "string" ? b[key].toLowerCase() : b[key];
      return order === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
        ? 1
        : -1;
    });
    setFilteredStocks(sorted);
    setSortKey(key);
    setSortOrder(order);
  };

  const addStock = () => {
    if (!newStock.name || !newStock.quantity || !newStock.avgPrice) return;
    setStocks([...stocks, { ...newStock, quantity: Number(newStock.quantity), avgPrice: Number(newStock.avgPrice) }]);
    setNewStock({ name: "", quantity: "", avgPrice: "" });
  };

  return (
    <motion.div
      className="p-4 grid gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
            <Input
              placeholder="Search stocks..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="flex-grow"
            />
            <Input
              placeholder="Stock name"
              value={newStock.name}
              onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newStock.quantity}
              onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Avg Price"
              value={newStock.avgPrice}
              onChange={(e) => setNewStock({ ...newStock, avgPrice: e.target.value })}
            />
            <Button onClick={addStock}>Add Stock</Button>
            <Button onClick={handleAnalyze}>Analyze</Button>
            <Button onClick={handleSave}>Save Portfolio</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => sortStocks("name")}>Stock</TableHead>
                <TableHead onClick={() => sortStocks("quantity")}>Quantity</TableHead>
                <TableHead onClick={() => sortStocks("avgPrice")}>Avg Price</TableHead>
                {analyzed && (
                  <>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock) => (
                <TableRow key={stock.name}>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>{stock.avgPrice}</TableCell>
                  {analyzed && stockData[stock.name] && (
                    <>
                      <TableCell>{stockData[stock.name].currentPrice}</TableCell>
                      <TableCell>
                        {(
                          (stockData[stock.name].currentPrice - stock.avgPrice) *
                          stock.quantity
                        ).toFixed(2)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
