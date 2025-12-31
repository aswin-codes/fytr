import { AiAnalysis } from "../types/aiAnalysisTypes";

export const aiFormAnalyses : AiAnalysis[] = [
    {
        id: "a1",
        exercise: "Barbell Squat",
        recordedAt: "2024-10-24T08:30:00",
        durationSeconds: 28,

        score: 82,
        verdict: "Great Form!",
        status: "good", // good | warning | critical

        videoUrl: "https://res.cloudinary.com/ddkpclbs2/video/upload/v1767163370/exercises/6547796-uhd_2160_3840_24fps_rx2dej.mp4",

        positives: [
            "Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained.",
        ],

        improvements: ["Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained."],

        aiCoachTip:
            "Try widening your stance slightly by about 2 inches. This may help stabilize your knee alignment naturally.",

        actions: {
            canSave: true,
            canDelete: true,
            isCurrent: true, 
        },
    },
    {
        id: "a2",
        exercise: "Barbell Squat",
        recordedAt: "2024-10-24T08:30:00",
        durationSeconds: 28,

        score: 65,
        verdict: "Great Form!",
        status: "good", // good | warning | critical

        videoUrl: "https://res.cloudinary.com/ddkpclbs2/video/upload/v1767163370/exercises/6547796-uhd_2160_3840_24fps_rx2dej.mp4",

        positives: [
            "Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained.",
        ],

        improvements: ["Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained."],

        aiCoachTip:
            "Try widening your stance slightly by about 2 inches. This may help stabilize your knee alignment naturally.",

        actions: {
            canSave: true,
            canDelete: true,
            isCurrent: true, 
        },
    },
    {
        id: "a3",
        exercise: "Barbell Squat",
        recordedAt: "2024-10-24T08:30:00",
        durationSeconds: 28,

        score: 45,
        verdict: "Great Form!",
        status: "good", // good | warning | critical

        videoUrl: "https://res.cloudinary.com/ddkpclbs2/video/upload/v1767163370/exercises/6547796-uhd_2160_3840_24fps_rx2dej.mp4",

        positives: [
            "Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained.",
        ],

        improvements: ["Good back alignment throughout the movement.",
            "Consistent tempo on the descent.",
            "Strong core engagement maintained."],

        aiCoachTip:
            "Try widening your stance slightly by about 2 inches. This may help stabilize your knee alignment naturally.",

        actions: {
            canSave: true,
            canDelete: true,
            isCurrent: true, 
        },
    },
];
