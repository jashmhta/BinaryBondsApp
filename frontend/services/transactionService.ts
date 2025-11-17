/**
 * Transaction Service
 */
import { apiService } from './api';

export interface Transaction {
  _id: string;
  bond_name: string;
  isin: string;
  transaction_type: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  total_amount: number;
  gst_amount: number;
  date: string;
  contract_note?: string;
}

export interface CreateTransactionData {
  bond_id: string;
  transaction_type: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  date: string;
  contract_note?: string;
}

class TransactionService {
  async getTransactions(): Promise<Transaction[]> {
    return apiService.get<Transaction[]>('/api/transactions/list');
  }

  async createTransaction(data: CreateTransactionData): Promise<{ success: boolean; transaction_id: string }> {
    return apiService.post('/api/transactions/create', data);
  }
}

export const transactionService = new TransactionService();
