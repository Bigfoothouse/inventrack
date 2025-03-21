import React, { useState, useEffect } from 'react';
import { LiquorItem, OtherStockItem, DailyStock } from '@/app/types/inventory';
import { calculateTotalML } from '@/app/utils/liquorCalculations';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface DailyStockFormProps {
  liquorItems: LiquorItem[];
  otherStockItems: OtherStockItem[];
  onSubmit: (data: Omit<DailyStock, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Partial<DailyStock>;
}

export default function DailyStockForm({
  liquorItems,
  otherStockItems,
  onSubmit,
  initialData = {}
}: DailyStockFormProps) {
  const [selectedType, setSelectedType] = useState<'liquor' | 'other'>(
    initialData.itemType || 'liquor'
  );
  
  const [selectedItemId, setSelectedItemId] = useState(initialData.itemId || '');
  
  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    bottles: initialData.bottles !== undefined ? initialData.bottles.toString() : '0',
    milliliters: initialData.milliliters !== undefined ? initialData.milliliters.toString() : '0',
    quantity: initialData.quantity !== undefined ? initialData.quantity.toString() : '0'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalML, setTotalML] = useState(0);
  
  useEffect(() => {
    // Calculate total ML when bottles or milliliters change (for liquor items)
    if (selectedType === 'liquor') {
      const bottles = parseFloat(formData.bottles) || 0;
      const milliliters = parseFloat(formData.milliliters) || 0;
      setTotalML(calculateTotalML(bottles, milliliters));
    }
  }, [formData.bottles, formData.milliliters, selectedType]);
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'liquor' | 'other';
    setSelectedType(type);
    setSelectedItemId(''); // Reset selected item when type changes
  };
  
  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItemId(e.target.value);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!selectedItemId) {
      newErrors.itemId = 'Please select an item';
    }
    
    if (selectedType === 'liquor') {
      const bottles = parseFloat(formData.bottles);
      if (isNaN(bottles) || bottles < 0) {
        newErrors.bottles = 'Bottles must be a non-negative number';
      }
      
      const milliliters = parseFloat(formData.milliliters);
      if (isNaN(milliliters) || milliliters < 0 || milliliters >= 750) {
        newErrors.milliliters = 'Milliliters must be between 0 and 749';
      }
    } else {
      const quantity = parseFloat(formData.quantity);
      if (isNaN(quantity) || quantity < 0) {
        newErrors.quantity = 'Quantity must be a non-negative number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const baseData = {
        date: formData.date,
        itemId: selectedItemId,
        itemType: selectedType
      };
      
      let submitData;
      
      if (selectedType === 'liquor') {
        const bottles = parseFloat(formData.bottles) || 0;
        const milliliters = parseFloat(formData.milliliters) || 0;
        const totalML = calculateTotalML(bottles, milliliters);
        
        submitData = {
          ...baseData,
          bottles,
          milliliters,
          totalML
        };
      } else {
        submitData = {
          ...baseData,
          quantity: parseFloat(formData.quantity) || 0
        };
      }
      
      await onSubmit(submitData as any);
      
      // Reset form
      setFormData({
        ...formData,
        bottles: '0',
        milliliters: '0',
        quantity: '0'
      });
      setSelectedItemId('');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.date ? 'border-red-500' : 'border-gray-300'}
          `}
          required
        />
        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-1">
          Item Type
        </label>
        <select
          id="itemType"
          value={selectedType}
          onChange={handleTypeChange}
          className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          <option value="liquor">Liquor</option>
          <option value="other">Other Stock</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Item
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="itemId"
          value={selectedItemId}
          onChange={handleItemChange}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.itemId ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          <option value="">-- Select an item --</option>
          {selectedType === 'liquor'
            ? liquorItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.brand}
                </option>
              ))
            : otherStockItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
        </select>
        {errors.itemId && <p className="mt-1 text-sm text-red-500">{errors.itemId}</p>}
      </div>
      
      {selectedType === 'liquor' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              id="bottles"
              name="bottles"
              label="Bottles"
              type="number"
              value={formData.bottles}
              onChange={handleChange}
              error={errors.bottles}
              min={0}
              step={0.25}
              required
              className="flex-1"
            />
            
            <Input
              id="milliliters"
              name="milliliters"
              label="Additional Milliliters (ML)"
              type="number"
              value={formData.milliliters}
              onChange={handleChange}
              error={errors.milliliters}
              min={0}
              max={749}
              required
              className="flex-1"
            />
          </div>
          
          <div className="mt-2 p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium">Total Volume: {totalML} ML</p>
          </div>
        </>
      ) : (
        <Input
          id="quantity"
          name="quantity"
          label="Quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          min={0}
          required
        />
      )}
      
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Daily Stock'}
        </Button>
      </div>
    </form>
  );
} 