'use client';

import React, { useState, useEffect } from 'react';
import { 
  getStockMovementByDate,
  getAllLiquorItems,
  getAllOtherStockItems
} from '../services/inventoryService';
import { StockMovement, LiquorItem, OtherStockItem } from '../types/inventory';
import Navbar from '../components/layout/Navbar';
import { formatLiquorQuantity } from '../utils/liquorCalculations';

export default function StockMovementPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [stockMovement, setStockMovement] = useState<StockMovement[]>([]);
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
        
        await fetchStockMovement(date);
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  async function fetchStockMovement(selectedDate: string) {
    try {
      setLoading(true);
      const movementData = await getStockMovementByDate(selectedDate);
      setStockMovement(movementData);
      setError('');
    } catch (err) {
      console.error('Error fetching stock movement:', err);
      setError('Failed to load stock movement data');
    } finally {
      setLoading(false);
    }
  }
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    fetchStockMovement(newDate);
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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Stock Movement (Sales)</h1>
            <p className="mt-2 text-gray-600">
              View sales based on daily stock changes. Positive values indicate items sold/used.
            </p>
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
              <p className="text-gray-500">Loading stock movement data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
              <button 
                onClick={() => fetchStockMovement(date)}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : stockMovement.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 mb-4">No stock movement data found for {date}</p>
                <p className="text-sm text-gray-500">
                  This could be because there is no stock data for this date or the previous date to compare with.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sales for {date}</h2>
                
                {/* Liquor Sales Section */}
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
                            Previous Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stockMovement
                          .filter(movement => movement.itemType === 'liquor')
                          .map(movement => {
                            const item = findItemById(movement.itemId, 'liquor') as LiquorItem;
                            if (!item) return null;
                            
                            const previous = movement.previousStock as { 
                              bottles: number; 
                              milliliters: number; 
                              totalML: number 
                            };
                            
                            const current = movement.currentStock as { 
                              bottles: number; 
                              milliliters: number; 
                              totalML: number 
                            };
                            
                            const difference = movement.difference as { 
                              bottles: number; 
                              milliliters: number; 
                              totalML: number 
                            };
                            
                            // Determine if there was any sales
                            const hasSales = difference.totalML > 0;
                            
                            return (
                              <tr key={movement.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.brand}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatLiquorQuantity(previous.bottles, previous.milliliters)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatLiquorQuantity(current.bottles, current.milliliters)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${hasSales ? 'text-green-600' : 'text-gray-500'}`}>
                                  {hasSales 
                                    ? formatLiquorQuantity(difference.bottles, difference.milliliters)
                                    : 'No sales'}
                                </td>
                              </tr>
                            );
                          })}
                        {stockMovement.filter(movement => movement.itemType === 'liquor').length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No liquor sales data for this date
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Other Stock Sales Section */}
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
                            Previous Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stockMovement
                          .filter(movement => movement.itemType === 'other')
                          .map(movement => {
                            const item = findItemById(movement.itemId, 'other') as OtherStockItem;
                            if (!item) return null;
                            
                            const previous = movement.previousStock as number;
                            const current = movement.currentStock as number;
                            const difference = movement.difference as number;
                            
                            // Determine if there was any sales
                            const hasSales = difference > 0;
                            
                            return (
                              <tr key={movement.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {previous} {item.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {current} {item.unit}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${hasSales ? 'text-green-600' : 'text-gray-500'}`}>
                                  {hasSales 
                                    ? `${difference} ${item.unit}`
                                    : 'No sales'}
                                </td>
                              </tr>
                            );
                          })}
                        {stockMovement.filter(movement => movement.itemType === 'other').length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              No other stock sales data for this date
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