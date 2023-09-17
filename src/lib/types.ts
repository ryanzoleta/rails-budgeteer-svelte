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
