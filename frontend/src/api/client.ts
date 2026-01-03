import { getToken } from "@/src/utils/getToken";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://192.168.1.10:3000/api",
    //baseURL: 'https://backendfytr.vercel.app/api',
    timeout: 20000,
});

apiClient.interceptors.request.use(async (config) => {
    console.log("📡 API Request:", config.method?.toUpperCase(), config.url);

    try {
        const token = await getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Token attached to request");
        } else {
            console.warn("⚠️ No token available");
        }
    } catch (error) {
        console.error("❌ Error getting token for API request:", error);
        throw error;
    }

    return config;
}, (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
});
