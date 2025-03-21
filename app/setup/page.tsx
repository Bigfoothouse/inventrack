'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { registerUser } from '../services/authService';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkIfSetupNeeded() {
      try {
        // Check if any users exist in the system
        const querySnapshot = await getDocs(collection(db, 'users'));
        
        if (querySnapshot.empty) {
          // No users exist - setup is needed
          setSetupNeeded(true);
        } else {
          // Users already exist - redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking users:', error);
        setErrors({ form: 'Failed to check if setup is needed. Please try again.' });
      } finally {
        setLoading(false);
      }
    }

    checkIfSetupNeeded();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setCreatingAdmin(true);
    
    try {
      // Register the first user as an admin
      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        'admin' // First user is always an admin
      );
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setErrors({
        form: error.message || 'Failed to create admin user. Please try again.'
      });
    } finally {
      setCreatingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!setupNeeded) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            First-time Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create the administrator account for your inventory system
          </p>
        </div>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
            <p>Admin user created successfully! Redirecting to login...</p>
          </div>
        )}
        
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
            <p>{errors.form}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="name"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
          
          <div>
            <Button
              type="submit"
              disabled={creatingAdmin}
              className="w-full"
            >
              {creatingAdmin ? 'Creating Admin User...' : 'Create Admin User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 