import { formatDate } from './utils';

export type AccountType = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type Account = {
  id: number;
  name: string;
  account_type_id: number;
  created_at: Date;
  updated_at: Date;
  balance?: number;
};

export type Category = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
};

export type Budget = {
  id: number;
  month: number;
  year: number;
  category_id: number;
  budgeted_amount: number;
  created_at: Date;
  updated_at: Date;
  sum?: number;
};

export type Transaction = {
  id: number;
  date: string;
  account_id: number;
  amount: number;
  category_id: number;
  created_at: Date;
  updated_at: Date;
  account?: Account;
  category?: Category;
};

export const defaultCategory: Category = {
  id: 0,
  name: '',
  created_at: new Date(),
  updated_at: new Date()
};

export const defaultTransaction: Transaction = {
  id: 0,
  date: formatDate(new Date()),
  account_id: 0,
  amount: 0,
  category_id: 0,
  created_at: new Date(),
  updated_at: new Date()
};
