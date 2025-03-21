'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { updateOtherStockItem } from '../../../services/inventoryService';
import { OtherStockItem } from '../../../types/inventory';
import Navbar from '../../../components/layout/Navbar';
import OtherStockForm from '../../../components/otherStock/OtherStockForm';
import Button from '../../../components/ui/Button';

export default function EditOtherStockPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [stockItem, setStockItem] = useState<OtherStockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchStockItem() {
      try {
        setLoading(true);
        const docRef = doc(db, 'otherStockItems', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStockItem({
            id: docSnap.id,
            ...docSnap.data()
          } as OtherStockItem);
        } else {
          setError('Stock item not found');
        }
      } catch (err) {
        console.error('Error fetching stock item:', err);
        setError('Failed to load stock item');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchStockItem();
    }
  }, [id]);
  
  const handleSubmit = async (formData: any) => {
    try {
      await updateOtherStockItem(id, formData);
      router.push('/other-stock');
    } catch (err) {
      console.error('Error updating stock item:', err);
      setError('Failed to update stock item');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading stock item...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !stockItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>{error || 'Item not found'}</p>
            <Link href="/other-stock">
              <Button variant="secondary" className="mt-4">Back to Inventory</Button>
            </Link>
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
            <h1 className="text-2xl font-semibold text-gray-900">Edit Stock Item</h1>
            
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
              <OtherStockForm 
                onSubmit={handleSubmit} 
                initialData={stockItem}
                submitLabel="Update Stock Item"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 