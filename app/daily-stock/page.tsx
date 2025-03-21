'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getDailyStockByDate,
  getAllLiquorItems,
  getAllOtherStockItems
} from '../services/inventoryService';
import { DailyStock, LiquorItem, OtherStockItem } from '../types/inventory';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { formatLiquorQuantity } from '../utils/liquorCalculations';

export default function DailyStockPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStock, setDailyStock] = useState<DailyStock[]>([]);
  const [liquorItems, setLiquorItems] = useState<LiquorItem[]>([]);
  const [otherStockItems, setOtherStockItems] = useState<OtherStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch inventory items to display names
        const [liquorData, otherData] = await Promise.all([
          getAllLiquorItems(),
          getAllOtherStockItems()
        ]);
        
        setLiquorItems(liquorData);
        setOtherStockItems(otherData);
        
        await fetchDailyStock(date);
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  async function fetchDailyStock(selectedDate: string) {
    try {
      setLoading(true);
      const stockData = await getDailyStockByDate(selectedDate);
      setDailyStock(stockData);
      setError('');
    } catch (err) {
      console.error('Error fetching daily stock:', err);
      setError('Failed to load daily stock data');
    } finally {
      setLoading(false);
    }
  }
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    fetchDailyStock(newDate);
  };
  
  // Find item details by id
  const findItemById = (id: string, type: 'liquor' | 'other') => {
    if (type === 'liquor') {
      return liquorItems.find(item => item.id === id);
    } else {
      return otherStockItems.find(item => item.id === id);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Daily Stock</h1>
            
            <Link href="/daily-stock/add">
              <Button>Record Daily Stock</Button>
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mr-4">
                  Select Date:
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={date}
                  onChange={handleDateChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading daily stock data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
              <button 
                onClick={() => fetchDailyStock(date)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : dailyStock.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 mb-4">No stock data found for {date}</p>
                <Link href="/daily-stock/add">
                  <Button>Record Stock</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Stock for {date}</h2>
                
                {/* Liquor Stock Section */}
                <div className="mb-8">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Liquor Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bottles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Milliliters
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Volume
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyStock
                          .filter(stock => stock.itemType === 'liquor')
                          .map(stock => {
                            const item = findItemById(stock.itemId, 'liquor') as LiquorItem;
                            if (!item) return null;
                            
                            return (
                              <tr key={stock.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.brand}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stock.bottles}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stock.milliliters} ML
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stock.totalML} ML ({formatLiquorQuantity(stock.bottles || 0, stock.milliliters || 0)})
                                </td>
                              </tr>
                            );
                          })}
                        {dailyStock.filter(stock => stock.itemType === 'liquor').length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No liquor stock recorded for this date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Other Stock Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Other Stock Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyStock
                          .filter(stock => stock.itemType === 'other')
                          .map(stock => {
                            const item = findItemById(stock.itemId, 'other') as OtherStockItem;
                            if (!item) return null;
                            
                            return (
                              <tr key={stock.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {stock.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.unit}
                                </td>
                              </tr>
                            );
                          })}
                        {dailyStock.filter(stock => stock.itemType === 'other').length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                              No other stock recorded for this date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 