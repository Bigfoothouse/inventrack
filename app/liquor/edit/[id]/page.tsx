'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { updateLiquorItem } from '../../../services/inventoryService';
import { LiquorItem } from '../../../types/inventory';
import Navbar from '../../../components/layout/Navbar';
import LiquorForm from '../../../components/liquor/LiquorForm';
import Button from '../../../components/ui/Button';

export default function EditLiquorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [liquorItem, setLiquorItem] = useState<LiquorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchLiquorItem() {
      try {
        setLoading(true);
        const docRef = doc(db, 'liquorItems', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setLiquorItem({
            id: docSnap.id,
            ...docSnap.data()
          } as LiquorItem);
        } else {
          setError('Liquor item not found');
        }
      } catch (err) {
        console.error('Error fetching liquor item:', err);
        setError('Failed to load liquor item');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchLiquorItem();
    }
  }, [id]);
  
  const handleSubmit = async (formData: any) => {
    try {
      await updateLiquorItem(id, formData);
      router.push('/liquor');
    } catch (err) {
      console.error('Error updating liquor item:', err);
      setError('Failed to update liquor item');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading liquor item...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !liquorItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
            <p>{error || 'Item not found'}</p>
            <Link href="/liquor">
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
            <h1 className="text-2xl font-semibold text-gray-900">Edit Liquor Item</h1>
            
            <Link href="/liquor">
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
              <LiquorForm 
                onSubmit={handleSubmit} 
                initialData={liquorItem}
                submitLabel="Update Liquor Item"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 