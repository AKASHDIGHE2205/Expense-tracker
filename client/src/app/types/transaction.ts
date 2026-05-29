import { Category } from "./category";

export interface Transaction {
  _id: string;
  id?: string;
  amount: number;
  transactionType: 'Cr' | 'Dr';
  notes?: string;
  date: string;
  categoryId: Category | null;
  c_by: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}