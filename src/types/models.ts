// Main entity types
export type Business = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Income = {
  id: string;
  user_id: string;
  business_id: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  business_id: string;
  item: string;
  category: string;
  amount: number;
  notes: string;
  date: string;
  created_at: string;
  updated_at: string;
};

// Date range and filter state
export type DateRange = {
  from: Date;
  to: Date;
};

export type FilterState = {
  businessId: string | null;
  dateRange: DateRange;
  expenseCategory: string | null;
};
export type BusinessRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type IncomeRow = {
  id: string;
  user_id: string;
  business_id: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  date: string; // yyyy-mm-dd
  created_at: string;
  updated_at: string;
};

export type ExpenseRow = {
  id: string;
  user_id: string;
  business_id: string;
  item: string;
  category: string;
  amount: number;
  notes: string;
  date: string; // yyyy-mm-dd
  created_at: string;
  updated_at: string;
};

