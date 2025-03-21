import React, { useState } from 'react';
import { OtherStockItem } from '@/app/types/inventory';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface OtherStockFormProps {
  onSubmit: (data: Omit<OtherStockItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Partial<OtherStockItem>;
  submitLabel?: string;
}

export default function OtherStockForm({
  onSubmit,
  initialData = {},
  submitLabel = 'Add Stock Item'
}: OtherStockFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    category: initialData.category || '',
    quantity: initialData.quantity !== undefined ? initialData.quantity.toString() : '0',
    unit: initialData.unit || '',
    threshold: initialData.threshold !== undefined ? initialData.threshold.toString() : '1'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
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
        category: formData.category,
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        threshold: parseFloat(formData.threshold) || 1
      });
      
      // Clear form if it's a new item
      if (!initialData.id) {
        setFormData({
          name: '',
          category: '',
          quantity: '0',
          unit: '',
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
        name="name"
        label="Item Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      
      <Input
        id="category"
        name="category"
        label="Category"
        value={formData.category}
        onChange={handleChange}
        error={errors.category}
        required
      />
      
      <div className="flex flex-col sm:flex-row gap-4">
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
          className="flex-1"
        />
        
        <Input
          id="unit"
          name="unit"
          label="Unit (e.g., bottles, packs, cartons)"
          value={formData.unit}
          onChange={handleChange}
          error={errors.unit}
          required
          className="flex-1"
        />
      </div>
      
      <Input
        id="threshold"
        name="threshold"
        label="Low Stock Alert Threshold"
        type="number"
        value={formData.threshold}
        onChange={handleChange}
        error={errors.threshold}
        min={0}
        required
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