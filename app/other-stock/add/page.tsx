'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addOtherStockItem } from '../../services/inventoryService';
import Navbar from '../../components/layout/Navbar';
import OtherStockForm from '../../components/otherStock/OtherStockForm';
import Button from '../../components/ui/Button';

export default function AddOtherStockPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData: any) => {
    try {
      await addOtherStockItem(formData);
      router.push('/other-stock');
    } catch (err) {
      console.error('Error adding stock item:', err);
      setError('Failed to add stock item');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Add Stock Item</h1>
            
            <Link href="/other-stock">
              <Button variant="secondary">Back to Inventory</Button>
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <OtherStockForm onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 