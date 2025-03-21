'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../types/user';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoggedIn } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { label: 'Dashboard', href: '/', permission: 'view_inventory' },
    { label: 'Liquor Stock', href: '/liquor', permission: 'view_inventory' },
    { label: 'Other Stock', href: '/other-stock', permission: 'view_inventory' },
    { label: 'Daily Stock', href: '/daily-stock', permission: 'view_inventory' },
    { label: 'Stock Movement', href: '/stock-movement', permission: 'view_sales' },
  ];

  // Admin-only menu items
  const adminItems = [
    { label: 'User Management', href: '/admin/users', permission: 'manage_users' }
  ];
  
  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => 
    !item.permission || (user && hasPermission(user, item.permission))
  );
  
  const filteredAdminItems = adminItems.filter(item => 
    user && hasPermission(user, item.permission)
  );
  
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl tracking-tight">
              Inventory Management
            </Link>
          </div>
          
          <div className="hidden md:block flex-1 mx-8">
            <div className="flex justify-center space-x-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-blue-800 text-white shadow-inner'
                      : 'text-blue-50 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {filteredAdminItems.length > 0 && (
                <div className="relative group z-20">
                  <button
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      pathname.startsWith('/admin')
                        ? 'bg-blue-800 text-white shadow-inner'
                        : 'text-blue-50 hover:bg-blue-500 hover:text-white'
                    }`}
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    Admin
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={`absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition transform opacity-0 scale-95 
                    ${menuOpen || 'group-hover:opacity-100 group-hover:scale-100'}`}
                  >
                    {filteredAdminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center">
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center text-sm font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                  >
                    <div className="flex items-center space-x-2 bg-blue-800 rounded-full py-1 px-3 hover:bg-blue-900 transition-colors duration-200">
                      <span className="text-xs font-medium bg-blue-600 text-white rounded-full px-2 py-0.5">
                        {user.role}
                      </span>
                      <span>{user.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.href
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-50 hover:bg-blue-600 hover:text-white'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {filteredAdminItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith('/admin')
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-50 hover:bg-blue-600 hover:text-white'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {user && (
            <div className="mt-4 pt-4 border-t border-blue-500">
              <div className="flex items-center px-3 py-2">
                <span className="mr-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                  {user.role}
                </span>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="mt-2 block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-800 hover:bg-blue-900 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 