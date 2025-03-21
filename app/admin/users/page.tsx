'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, updateUserRole } from '../../services/authService';
import { User, UserRole, hasPermission } from '../../types/user';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user has permission to access this page
    if (user && !hasPermission(user, 'manage_users')) {
      router.push('/');
      return;
    }

    async function fetchUsers() {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUsers();
    }
  }, [user, router]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
              
              <Link href="/admin/users/add">
                <Button>Add New User</Button>
              </Link>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                <p>{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.map(userItem => (
                    <li key={userItem.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-medium text-gray-900">{userItem.name}</h3>
                            <p className="text-sm text-gray-500">{userItem.email}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {userItem.role}
                            </span>
                            
                            <select
                              value={userItem.role}
                              onChange={(e) => handleRoleChange(userItem.id, e.target.value as UserRole)}
                              disabled={userItem.id === user.id} // Can't change your own role
                              className="ml-2 block pl-3 pr-10 py-2 text-base border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                              <option value="admin" className="text-gray-800 bg-white">Admin</option>
                              <option value="manager" className="text-gray-800 bg-white">Manager</option>
                              <option value="staff" className="text-gray-800 bg-white">Staff</option>
                            </select>
                            
                            {userItem.id === user.id && (
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">(Current User)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 