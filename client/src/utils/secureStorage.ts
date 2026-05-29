// // utils/authStorage.js
// import * as SecureStore from 'expo-secure-store';

// export const saveToken = async (token:any) => {
//   await SecureStore.setItemAsync('token', token);
// };
// export const saveUser = async (user:any) => {
//   await SecureStore.setItemAsync('user', JSON.stringify(user));
// };

// export const getToken = async () => {
//   return await SecureStore.getItemAsync('token');
// };

// export const getUser = async () => {
//   const user = await SecureStore.getItemAsync('user');
//   return user ? JSON.parse(user) : null;
// };

// export const removeToken = async () => {
//   await SecureStore.deleteItemAsync('token');
// };

// utils/authStorage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
    return;
  }

  await SecureStore.setItemAsync('token', token);
};

export const saveUser = async (user: any) => {
  const data = JSON.stringify(user);

  if (Platform.OS === 'web') {
    localStorage.setItem('user', data);
    return;
  }

  await SecureStore.setItemAsync('user', data);
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }

  return await SecureStore.getItemAsync('token');
};

export const getUser = async () => {
  const user = Platform.OS === 'web' ? localStorage.getItem('user') : await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return;
  }

  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
};