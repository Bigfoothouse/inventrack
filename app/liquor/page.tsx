'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getAllLiquorItems, 
  deleteLiquorItem 
} from '../services/inventoryService';
import { LiquorItem } from '../types/inventory';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { formatLiquorQuantity } from '../utils/liquorCalculations';

export default function LiquorPage() {
  const [liquorItems, setLiquorItems] = useState<LiquorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchLiquorItems();
  }, []);
  
  async function fetchLiquorItems() {
    try {
      setLoading(true);
      const items = await getAllLiquorItems();
      setLiquorItems(items);
      setError('');
    } catch (err) {
      console.error('Error fetching liquor items:', err);
      setError('Failed to load liquor items');
    } finally {
      setLoading(false);
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteLiquorItem(id);
        setLiquorItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error deleting liquor item:', err);
        alert('Failed to delete the item');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Liquor Inventory</h1>
            
            <Link href="/liquor/add">
              <Button>Add Liquor Item</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading liquor inventory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
              <button 
                onClick={fetchLiquorItems}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          ) : liquorItems.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 mb-4">No liquor items found in the inventory</p>
                <Link href="/liquor/add">
                  <Button>Add First Item</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow overflow-hidden rounded-lg">
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
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bottles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ML
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Volume
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liquorItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.bottles}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.milliliters} ML
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.totalML} ML ({formatLiquorQuantity(item.bottles, item.milliliters)})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/liquor/edit/${item.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 