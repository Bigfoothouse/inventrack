'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllLiquorItems, getAllOtherStockItems } from '@/app/services/inventoryService';
import { LiquorItem, OtherStockItem } from '@/app/types/inventory';
import { formatLiquorQuantity } from '@/app/utils/liquorCalculations';

interface LowStockItem {
  id: string;
  name: string;
  type: 'liquor' | 'other';
  currentStock: string;
  threshold: string;
  link: string;
}

export default function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    async function checkLowStock() {
      try {
        setLoading(true);
        
        // Fetch all inventory items
        const [liquorItems, otherItems] = await Promise.all([
          getAllLiquorItems(),
          getAllOtherStockItems()
        ]);
        
        const lowStockList: LowStockItem[] = [];
        
        // Check liquor items
        liquorItems.forEach((item: LiquorItem) => {
          if (item.bottles < item.threshold) {
            lowStockList.push({
              id: item.id,
              name: item.name,
              type: 'liquor',
              currentStock: formatLiquorQuantity(item.bottles, item.milliliters),
              threshold: `${item.threshold} bottles`,
              link: `/liquor/edit/${item.id}`
            });
          }
        });
        
        // Check other stock items
        otherItems.forEach((item: OtherStockItem) => {
          if (item.quantity < item.threshold) {
            lowStockList.push({
              id: item.id,
              name: item.name,
              type: 'other',
              currentStock: `${item.quantity} ${item.unit}`,
              threshold: `${item.threshold} ${item.unit}`,
              link: `/other-stock/edit/${item.id}`
            });
          }
        });
        
        setLowStockItems(lowStockList);
      } catch (err) {
        console.error('Error checking low stock:', err);
        setError('Failed to check inventory levels');
      } finally {
        setLoading(false);
      }
    }
    
    checkLowStock();
  }, []);
  
  if (loading || lowStockItems.length === 0 || !isOpen) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">The following items are below their minimum threshold:</p>
            <ul className="list-disc pl-5 space-y-1">
              {lowStockItems.map(item => (
                <li key={item.id}>
                  <Link href={item.link} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <span className="text-yellow-600"> (Current: {item.currentStock}, Threshold: {item.threshold})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 