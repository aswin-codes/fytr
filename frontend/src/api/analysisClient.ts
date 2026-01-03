// src/api/analysisClient.ts
import { apiClient } from './client';
import { CreateAnalysisPayload } from '../types/aiAnalysisTypes';

export const getAllAnalyses = async (page: number = 1, limit: number = 20) => {
  try {
    console.log(`📡 Fetching analyses - Page ${page}, Limit ${limit}`);
    const res = await apiClient.get(`/analysis?page=${page}&limit=${limit}`);
    console.log('✅ Analyses fetched:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    throw error;
  }
};

export const createAnalysis = async (payload: CreateAnalysisPayload) => {
  try {
    console.log('📡 Creating analysis...', payload);
    const res = await apiClient.post('/analysis', payload);
    console.log('✅ Analysis created:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating analysis:', error);
    throw error;
  }
};

export const deleteAnalysis = async (analysisId: string) => {
  try {
    console.log('📡 Deleting analysis:', analysisId);
    const res = await apiClient.delete(`/analysis/${analysisId}`);
    console.log('✅ Analysis deleted:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error deleting analysis:', error);
    throw error;
  }
};