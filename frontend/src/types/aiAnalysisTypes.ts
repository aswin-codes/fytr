export interface AiAnalysis {
    id: string;
    exercise: string;
    recordedAt: string;
    durationSeconds: number;
    score: number;
    verdict: string;
    status: string;
    videoUrl: string;
    positives: string[];
    improvements: string[];
    aiCoachTip: string;
    actions: {
        canSave: boolean;
        canDelete: boolean;
        isCurrent: boolean;
    };
}
