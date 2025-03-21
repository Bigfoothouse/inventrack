'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  addDailyStock, 
  getAllLiquorItems, 
  getAllOtherStockItems 
} from '../../services/inventoryService';
import { LiquorItem, OtherStockItem } from '../../types/inventory';
import Navbar from '../../components/layout/Navbar';
import DailyStockForm from '../../components/dailyStock/DailyStockForm';
import Button from '../../components/ui/Button';

export default function AddDailyStockPage() {
  const router = useRouter();
  const [liquorItems, setLiquorItems] = useState<LiquorItem[]>([]);
  const [otherStockItems, setOtherStockItems] = useState<OtherStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchInventoryItems() {
      try {
        setLoading(true);
        const [liquorData, otherData] = await Promise.all([
          getAllLiquorItems(),
          getAllOtherStockItems()
        ]);
        
        setLiquorItems(liquorData);
        setOtherStockItems(otherData);
      } catch (err) {
        console.error('Error fetching inventory items:', err);
        setError('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInventoryItems();
  }, []);
  
  const handleSubmit = async (formData: any) => {
    try {
      await addDailyStock(formData);
      router.push('/daily-stock');
    } catch (err) {
      console.error('Error recording daily stock:', err);
      setError('Failed to record daily stock');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading inventory items...</p>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Record Daily Stock</h1>
            
            <Link href="/daily-stock">
              <Button variant="secondary">Back to Daily Stock</Button>
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {liquorItems.length === 0 && otherStockItems.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 mb-4">No inventory items found. Please add items first.</p>
                <div className="flex justify-center space-x-4">
                  <Link href="/liquor/add">
                    <Button>Add Liquor Item</Button>
                  </Link>
                  <Link href="/other-stock/add">
                    <Button variant="secondary">Add Other Stock</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <DailyStockForm
                  liquorItems={liquorItems}
                  otherStockItems={otherStockItems}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 