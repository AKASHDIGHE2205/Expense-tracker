import axios from 'axios';
import { getToken } from '../utils/secureStorage';

 const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getAllCategories = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/category/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};

export const createCategory = async (data: any) => {
  try {
    const token = await getToken();
    const response = await axios.post(`${API_URL}/category/add`, data, {
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

export const getSingleCategory = async (id: string) => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/category/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};