export interface AiAnalysis {
  id: string;
  exercise: string;
  recordedAt: string; // Backend sends: recorded_at
  durationSeconds: number; // Backend sends: duration_seconds
  score: number;
  verdict: string;
  status: 'good' | 'warning' | 'critical';
  videoUrl: string; // Backend sends: video_url
  positives: string[];
  improvements: string[];
  aiCoachTip: string; // Backend sends: ai_coach_tip
  actions: {
    canSave: boolean;
    canDelete: boolean;
    isCurrent: boolean;
  };
}

// Payload to send to backend - MATCHES BACKEND EXACTLY
export interface CreateAnalysisPayload {
  exercise: string;
  recorded_at?: string;
  duration_seconds: number;
  video_url: string;
  score: number;
  verdict: string;
  status: 'good' | 'warning' | 'critical';
  positives: string[];
  improvements: string[];
  ai_coach_tip: string;
}

// Response from backend
export interface AnalysisResponse {
  success: boolean;
  message: string;
  analysis: {
    id: string;
    exercise: string;
    recordedAt: string;
    durationSeconds: number;
    videoUrl: string;
    score: number;
    verdict: string;
    status: 'good' | 'warning' | 'critical';
    positives: string[];
    improvements: string[];
    aiCoachTip: string;
    createdAt: string;
    actions: {
      canSave: boolean;
      canDelete: boolean;
      isCurrent: boolean;
    };
  };
}