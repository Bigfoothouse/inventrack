export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: any;
  updatedAt: any;
}

// Permission definitions for each role
export const ROLE_PERMISSIONS = {
  admin: [
    'view_inventory',
    'add_inventory',
    'edit_inventory',
    'delete_inventory',
    'view_sales',
    'manage_users',
    'view_reports',
    'export_data',
    'view_settings',
    'edit_settings'
  ],
  manager: [
    'view_inventory',
    'add_inventory',
    'edit_inventory',
    'view_sales',
    'view_reports',
    'export_data'
  ],
  staff: [
    'view_inventory',
    'add_inventory'
  ]
};

export type Permission = keyof typeof ROLE_PERMISSIONS;

// Helper function to check if a user has a specific permission
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role].includes(permission);
} 