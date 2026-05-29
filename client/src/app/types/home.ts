
export interface Category {
  _id: string;
  name: string;
  label: string;
  color: string;
  family: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  transactionType: 'Cr' | 'Dr';
  notes?: string;
  date: string;
  categoryId: Category;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

export interface SummaryApiResponse {
  success: boolean;
  data: SummaryData;
}
