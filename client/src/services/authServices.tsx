import { getToken } from '@/utils/secureStorage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const LoginService = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }

    throw { message: 'Network error' };
  }
};

export const RegisterService = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }

    throw { message: 'Network error' };
  }
};

export const ResetPassService = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }

    throw { message: 'Network error' };
  }
};

export const getUserProfile = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/auth/user-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;

  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { message: 'Network error' };
  }
};