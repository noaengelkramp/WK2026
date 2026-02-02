import api from './api';

// ==================== USER MANAGEMENT ====================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  isAdmin: boolean;
  languagePreference: 'en' | 'nl';
  createdAt: string;
  updatedAt: string;
  customer?: {
    customerNumber: string;
    companyName: string;
    isActive: boolean;
  };
}

export interface UsersPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  customerNumber: string;
  isAdmin?: boolean;
  languagePreference?: 'en' | 'nl';
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  customerNumber?: string;
  isAdmin?: boolean;
  languagePreference?: 'en' | 'nl';
}

export const adminUserService = {
  /**
   * Get all users with search and pagination
   */
  async getUsers(params: GetUsersParams = {}) {
    const { search = '', page = 1, limit = 50 } = params;
    const response = await api.get('/admin/users', {
      params: { search, page, limit },
    });
    return {
      users: response.data.users as User[],
      pagination: response.data.pagination as UsersPagination,
    };
  },

  /**
   * Get single user by ID
   */
  async getUserById(id: string) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.user as User;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData) {
    const response = await api.post('/admin/users', data);
    return response.data.user as User;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.user as User;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Reset user password
   */
  async resetPassword(id: string, newPassword: string) {
    const response = await api.post(`/admin/users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },
};

// ==================== CUSTOMER MANAGEMENT ====================

export interface Customer {
  id: string;
  customerNumber: string;
  companyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    createdAt?: string;
  };
}

export interface CustomersPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}

export interface CreateCustomerData {
  customerNumber: string;
  companyName: string;
  isActive?: boolean;
}

export interface UpdateCustomerData {
  companyName?: string;
  isActive?: boolean;
}

export interface BulkImportCustomer {
  customerNumber: string;
  companyName: string;
  isActive?: boolean;
}

export const adminCustomerService = {
  /**
   * Get all customers with search and pagination
   */
  async getCustomers(params: GetCustomersParams = {}) {
    const { search = '', page = 1, limit = 50, activeOnly = false } = params;
    const response = await api.get('/admin/customers', {
      params: { search, page, limit, activeOnly },
    });
    return {
      customers: response.data.customers as Customer[],
      pagination: response.data.pagination as CustomersPagination,
    };
  },

  /**
   * Get single customer by ID
   */
  async getCustomerById(id: string) {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data.customer as Customer;
  },

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerData) {
    const response = await api.post('/admin/customers', data);
    return response.data.customer as Customer;
  },

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: UpdateCustomerData) {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data.customer as Customer;
  },

  /**
   * Delete customer
   */
  async deleteCustomer(id: string) {
    const response = await api.delete(`/admin/customers/${id}`);
    return response.data;
  },

  /**
   * Bulk import customers
   */
  async bulkImport(customers: BulkImportCustomer[]) {
    const response = await api.post('/admin/customers/bulk-import', {
      customers,
    });
    return response.data.results;
  },
};

// ==================== ADMIN DASHBOARD ====================

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Get API-Football status and request usage
   */
  async getApiStatus() {
    const response = await api.get('/admin/dashboard/api-status');
    return response.data;
  },

  /**
   * Sync data from API-Football
   */
  async syncFromApi(data: { syncType: string; season: string }) {
    const response = await api.post('/admin/dashboard/sync', data);
    return response.data;
  },
};
