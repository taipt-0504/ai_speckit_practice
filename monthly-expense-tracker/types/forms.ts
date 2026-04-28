// Domain models
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  status: 'pending' | 'active' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  notes?: string | null;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  ownerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpendingLimit {
  id: string;
  limitType: 'monthly_total' | 'category';
  amount: number;
  month: number;
  year: number;
  userId: string;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Auth types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: Omit<User, 'password'>;
}

export interface CurrentUserResponse {
  user: User;
}
