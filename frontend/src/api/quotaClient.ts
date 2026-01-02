import { apiClient } from './client';

export const checkQuota = async () => {
  try {
    const res = await apiClient.post('/quota/check');
    return res.data;
  } catch (error) {
    console.error('Error checking quota:', error);
    throw error;
  }
};

export const incrementQuota = async () => {
  try {
    const res = await apiClient.post('/quota/increment');
    return res.data;
  } catch (error) {
    console.error('Error incrementing quota:', error);
    throw error;
  }
};

export const getQuotaStatus = async () => {
  try {
    const res = await apiClient.get('/quota/status');
    return res.data;
  } catch (error) {
    console.error('Error getting quota status:', error);
    throw error;
  }
};