import { registerUser, loginUser, loginUserWithGoogle } from "@/src/api/userClient";
import { userStorage } from "@/src/store/userStorage";
import { getUserOnboardingData } from "@/src/controllers/onboardingController";
import { fetchQuotaStatus } from "@/src/controllers/quotaController"; // ADD THIS\import { fetchQuotaStatus } from "@/src/controllers/quotaController";
import { fetchAllAnalyses } from "@/src/controllers/analysisController"; 

export const registerEmailAndPassword = async (
    email: string,
    password: string,
    fullName: string,
    createAccountEmailPassword: (email: string, password: string, fullName: string) => Promise<void>
) => {
    try {
        console.log("🔵 Step 1: Creating Firebase account...");
        await createAccountEmailPassword(email, password, fullName);
        console.log("✅ Step 1 Complete: Firebase account created");
        
        console.log("🔵 Step 2: Calling backend API to register user...");
        const response = await registerUser({ full_name: fullName });
        console.log("✅ Step 2 Complete: Backend API response:", response);
        
        console.log("🔵 Step 3: Saving user to storage...");
        userStorage.saveUser(response.user);
        console.log("✅ Step 3 Complete: User saved to storage");
        
        // ADD THIS: Fetch quota status
        console.log("🔵 Step 4: Fetching quota status...");
        try {
            await fetchQuotaStatus();
            console.log("✅ Step 4 Complete: Quota status fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch quota:", error);
        }
        
        console.log("🔵 Step 6: Fetching analyses...");
        try {
            await fetchAllAnalyses();
            console.log("✅ Step 6 Complete: Analyses fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch analyses:", error);
        }
        
        return response;
    } catch (error) {
        console.error("Error in registerEmailAndPassword:", error);
        throw error;
    }
}

export const loginUserWithEmailAndPassword = async (email: string, password: string, loginEmailPassword: (email: string, password: string) => Promise<void>) => {
    try {
        console.log("🔵 Step 1: Logging in with email and password...");
        await loginEmailPassword(email, password);
        console.log("✅ Step 1 Complete: Login successful");
        
        console.log("🔵 Step 2: Calling the backend API to login user...");
        const response = await loginUser({ email, password });
        console.log("✅ Step 2 Complete: Backend API response:", response);
        
        console.log("🔵 Step 3: Saving user to storage...");
        userStorage.saveUser(response.user);
        console.log("✅ Step 3 Complete: User saved to storage");
        
        // Check if user completed onboarding and fetch their data
        if (response.user?.onboarding_completed) {
            console.log("🔵 Step 4: User has completed onboarding, fetching onboarding data...");
            try {
                await getUserOnboardingData();
                console.log("✅ Step 4 Complete: Onboarding data fetched and saved");
            } catch (onboardingError) {
                console.error("⚠️ Failed to fetch onboarding data:", onboardingError);
            }
        }
        
        // ADD THIS: Fetch quota status
        console.log("🔵 Step 5: Fetching quota status...");
        try {
            await fetchQuotaStatus();
            console.log("✅ Step 5 Complete: Quota status fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch quota:", error);
        }
        
        console.log("🔵 Step 6: Fetching analyses...");
        try {
            await fetchAllAnalyses();
            console.log("✅ Step 6 Complete: Analyses fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch analyses:", error);
        }
        
        return response;
    } catch (error) {
        console.error("Error in loginEmailAndPassword:", error);
        throw error;
    }
}

export const loginWithGoogle = async (googleLogin: () => Promise<string | null>) => {
    try {
        console.log("🔵 Step 1: Logging in with Google...");
        const fullName = await googleLogin();
        console.log("✅ Step 1 Complete: Login successful");
        
        console.log("🔵 Step 2: Calling the backend API to login user...");
        const response = await loginUserWithGoogle({ full_name: fullName || "" });
        console.log("✅ Step 2 Complete: Backend API response:", response);
        
        console.log("🔵 Step 3: Saving user to storage...");
        userStorage.saveUser(response.user);
        console.log("✅ Step 3 Complete: User saved to storage");
        
        // Check if user completed onboarding and fetch their data
        if (response.user?.onboarding_completed) {
            console.log("🔵 Step 4: User has completed onboarding, fetching onboarding data...");
            try {
                await getUserOnboardingData();
                console.log("✅ Step 4 Complete: Onboarding data fetched and saved");
            } catch (onboardingError) {
                console.error("⚠️ Failed to fetch onboarding data:", onboardingError);
            }
        }
        
        // ADD THIS: Fetch quota status
        console.log("🔵 Step 5: Fetching quota status...");
        try {
            await fetchQuotaStatus();
            console.log("✅ Step 5 Complete: Quota status fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch quota:", error);
        }
        
        console.log("🔵 Step 6: Fetching analyses...");
        try {
            await fetchAllAnalyses();
            console.log("✅ Step 6 Complete: Analyses fetched");
        } catch (error) {
            console.error("⚠️ Failed to fetch analyses:", error);
        }
        
        return response;
    } catch (error) {
        console.error("Error in loginWithGoogle:", error);
        throw error;
    }
}