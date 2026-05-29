import axios from "axios";
import { getToken } from '../utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Add Transaction
export const addExpenses = async (data: any) => {
  try {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/tran/add-expenses`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

// Get All Transaction
export const getAllTran = async (params?: { fromDate?: string; toDate?: string; type?: string }) => {
  try {
    const token = await getToken();
    const queryParams = new URLSearchParams();

    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    if (params?.type && params.type !== 'All') queryParams.append('type', params.type);

    const url = `${API_URL}/tran/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

//Get Transaction by ID
export const getTransactionById = async (id: string) => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/tran/details/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

// Get Transaction Summary by Period
export const getTransactionSummary = async (period: string) => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/tran/summary`, {
      params: { period },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

// Get Recent Transactions (last 7 days)
export const getRecentTransactions = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/tran/recent`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

// Update Transaction
export const updateExpenses = async (data: any) => {
  try {
    const token = await getToken();
    const response = await axios.put(`${API_URL}/tran/update`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

// Delete Transaction
export const deleteTransaction = async (id: string) => {
  try {
    const token = await getToken();
    const response = await axios.delete(`${API_URL}/tran/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

export const getExportData = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/tran/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  }
  catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};
