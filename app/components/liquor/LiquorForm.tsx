import React, { useState, useEffect } from 'react';
import { LiquorItem } from '@/app/types/inventory';
import { calculateTotalML } from '@/app/utils/liquorCalculations';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface LiquorFormProps {
  onSubmit: (data: Omit<LiquorItem, 'id' | 'createdAt' | 'updatedAt' | 'totalML'>) => Promise<void>;
  initialData?: Partial<LiquorItem>;
  submitLabel?: string;
}

export default function LiquorForm({ 
  onSubmit, 
  initialData = {}, 
  submitLabel = 'Add Liquor Item' 
}: LiquorFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    brand: initialData.brand || '',
    category: initialData.category || '',
    bottles: initialData.bottles !== undefined ? initialData.bottles.toString() : '0',
    milliliters: initialData.milliliters !== undefined ? initialData.milliliters.toString() : '0',
    threshold: initialData.threshold !== undefined ? initialData.threshold.toString() : '1'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalML, setTotalML] = useState(0);
  
  useEffect(() => {
    // Calculate total ML when bottles or milliliters change
    const bottles = parseFloat(formData.bottles) || 0;
    const milliliters = parseFloat(formData.milliliters) || 0;
    setTotalML(calculateTotalML(bottles, milliliters));
  }, [formData.bottles, formData.milliliters]);
  
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    const bottles = parseFloat(formData.bottles);
    if (isNaN(bottles) || bottles < 0) {
      newErrors.bottles = 'Bottles must be a non-negative number';
    }
    
    const milliliters = parseFloat(formData.milliliters);
    if (isNaN(milliliters) || milliliters < 0) {
      newErrors.milliliters = 'Milliliters must be a non-negative number';
    }
    
    const threshold = parseFloat(formData.threshold);
    if (isNaN(threshold) || threshold < 0) {
      newErrors.threshold = 'Threshold must be a non-negative number';
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
      await onSubmit({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        bottles: parseFloat(formData.bottles) || 0,
        milliliters: parseFloat(formData.milliliters) || 0,
        threshold: parseFloat(formData.threshold) || 1
      });
      
      // Clear form if it's a new item
      if (!initialData.id) {
        setFormData({
          name: '',
          brand: '',
          category: '',
          bottles: '0',
          milliliters: '0',
          threshold: '1'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        label="Item Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      
      <Input
        id="brand"
        label="Brand"
        value={formData.brand}
        onChange={handleChange}
        error={errors.brand}
        required
      />
      
      <Input
        id="category"
        label="Category"
        value={formData.category}
        onChange={handleChange}
        error={errors.category}
        required
      />
      
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
          required
          className="flex-1"
        />
      </div>
      
      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
        <p className="text-sm font-medium text-gray-700">Total Volume: {totalML} ML</p>
      </div>
      
      <Input
        id="threshold"
        name="threshold"
        label="Low Stock Alert Threshold (bottles)"
        type="number"
        value={formData.threshold}
        onChange={handleChange}
        error={errors.threshold}
        min={0}
        step={0.25}
        required
        className="mt-4"
      />
      
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
} 