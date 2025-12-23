import { apiClient } from './client';

export const registerUser = async (payload: {
  full_name: string;
}) => {
  try {
    const res = await apiClient.post('/user/register', payload);
    return res.data;
    
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (payload: {
}) => {
  try {
    const res = await apiClient.post('/user/login', payload);
    return res.data;
    
  } catch (error) {
    throw error;
  }
};


