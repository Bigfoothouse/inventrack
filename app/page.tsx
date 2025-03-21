'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllLiquorItems } from './services/inventoryService';
import { getAllOtherStockItems } from './services/inventoryService';
import { getDailyStockByDate, getStockMovementByDate } from './services/inventoryService';
import { LiquorItem, OtherStockItem, DailyStock, StockMovement } from './types/inventory';
import Navbar from './components/layout/Navbar';
import { formatLiquorQuantity } from './utils/liquorCalculations';
import LowStockAlert from './components/alerts/LowStockAlert';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function HomePage() {
  return (
    <ProtectedRoute requiredPermission="view_inventory">
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const [liquorItems, setLiquorItems] = useState<LiquorItem[]>([]);
  const [otherStockItems, setOtherStockItems] = useState<OtherStockItem[]>([]);
  const [todayStock, setTodayStock] = useState<DailyStock[]>([]);
  const [stockMovement, setStockMovement] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [liquorData, otherData, todayStockData, movementData] = await Promise.all([
          getAllLiquorItems(),
          getAllOtherStockItems(),
          getDailyStockByDate(today),
          getStockMovementByDate(today)
        ]);
        
        setLiquorItems(liquorData);
        setOtherStockItems(otherData);
        setTodayStock(todayStockData);
        setStockMovement(movementData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [today]);
  
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inventory Dashboard</h1>
          
          {/* Low Stock Alert */}
          <LowStockAlert />
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading dashboard data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inventory Summary */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Summary</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-blue-800">Liquor Items</p>
                      <p className="text-3xl font-bold text-blue-900">{liquorItems.length}</p>
                      <Link href="/liquor" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">
                        View All
                      </Link>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-green-800">Other Stock Items</p>
                      <p className="text-3xl font-bold text-green-900">{otherStockItems.length}</p>
                      <Link href="/other-stock" className="mt-2 inline-block text-sm text-green-600 hover:text-green-800">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Today's Stock */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Today's Stock</h2>
                    <Link href="/daily-stock" className="text-sm text-blue-600 hover:text-blue-800">
                      Manage Daily Stock
                    </Link>
                  </div>
                  
                  {todayStock.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No stock entries for today</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {todayStock.slice(0, 5).map(stock => {
                        const item = findItemById(stock.itemId, stock.itemType);
                        if (!item) return null;
                        
                        return (
                          <li key={stock.id} className="py-2">
                            <p className="font-medium">{item.name}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{stock.itemType === 'liquor' ? 'Liquor' : 'Other'}</span>
                              {stock.itemType === 'liquor' ? (
                                <span>{formatLiquorQuantity(stock.bottles || 0, stock.milliliters || 0)}</span>
                              ) : (
                                <span>{stock.quantity} {(item as OtherStockItem).unit}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Recent Stock Movement */}
              <div className="bg-white overflow-hidden shadow rounded-lg md:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Stock Movement</h2>
                    <Link href="/stock-movement" className="text-sm text-blue-600 hover:text-blue-800">
                      View All Movements
                    </Link>
                  </div>
                  
                  {stockMovement.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No stock movement data available</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Previous Stock
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Stock
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sales/Used
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockMovement.slice(0, 5).map(movement => {
                            const item = findItemById(movement.itemId, movement.itemType);
                            if (!item) return null;
                            
                            return (
                              <tr key={movement.id}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {movement.itemType === 'liquor' ? 'Liquor' : 'Other'}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {movement.itemType === 'liquor' ? (
                                    formatLiquorQuantity(
                                      (movement.previousStock as any).bottles || 0,
                                      (movement.previousStock as any).milliliters || 0
                                    )
                                  ) : (
                                    <span>{movement.previousStock as number} {(item as OtherStockItem).unit}</span>
                                  )}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {movement.itemType === 'liquor' ? (
                                    formatLiquorQuantity(
                                      (movement.currentStock as any).bottles || 0,
                                      (movement.currentStock as any).milliliters || 0
                                    )
                                  ) : (
                                    <span>{movement.currentStock as number} {(item as OtherStockItem).unit}</span>
                                  )}
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  {movement.itemType === 'liquor' ? (
                                    formatLiquorQuantity(
                                      (movement.difference as any).bottles || 0,
                                      (movement.difference as any).milliliters || 0
                                    )
                                  ) : (
                                    <span>{movement.difference as number} {(item as OtherStockItem).unit}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white overflow-hidden shadow rounded-lg md:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/liquor/add" className="inline-block bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Add Liquor Item
                    </Link>
                    
                    <Link href="/other-stock/add" className="inline-block bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Add Other Stock
                    </Link>
                    
                    <Link href="/daily-stock/add" className="inline-block bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors">
                      Record Daily Stock
                    </Link>
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
