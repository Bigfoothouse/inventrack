'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const { login, isLoggedIn } = useAuth();
  const router = useRouter();

  // Check if setup is needed (no users exist)
  useEffect(() => {
    async function checkIfSetupNeeded() {
      try {
        // Check if any users exist in the system
        const querySnapshot = await getDocs(collection(db, 'users'));
        
        if (querySnapshot.empty) {
          // No users exist - redirect to setup
          router.push('/setup');
          return;
        }
      } catch (error) {
        console.error('Error checking users:', error);
      } finally {
        setCheckingSetup(false);
      }
    }

    checkIfSetupNeeded();
  }, [router]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left side - Illustration and welcome text */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-md mx-auto">
          <svg className="w-48 h-48 mx-auto mb-8" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M256 42.667C138.24 42.667 42.667 138.24 42.667 256C42.667 373.76 138.24 469.333 256 469.333C373.76 469.333 469.333 373.76 469.333 256C469.333 138.24 373.76 42.667 256 42.667Z" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M170.667 256H341.333" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M192 184.32L320 184.32" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M213.333 327.68L298.667 327.68" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M170.667 256L213.333 298.667" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M341.333 256L298.667 213.333" stroke="white" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-4xl font-bold mb-4 text-center">Inventory Management</h1>
          <p className="text-xl opacity-90 text-center leading-relaxed">
            Streamline your stock management, track movements, and enhance your business efficiency.
          </p>
          <div className="mt-12 flex justify-center space-x-3">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            <span className="w-3 h-3 bg-white rounded-full animate-pulse delay-150"></span>
            <span className="w-3 h-3 bg-white rounded-full animate-pulse delay-300"></span>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 rounded-md p-4 mb-6 animate-fade-in">
              <div className="flex">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-white text-gray-900 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need access? Contact your administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 