import type { Moment } from 'moment';

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
};

export const defaultCategory: Category = {
  id: 0,
  name: '',
  created_at: new Date(),
  updated_at: new Date()
};
