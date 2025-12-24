import { auth } from "@/src/utils/firebase";

export const getToken = async () => {
    console.log("🔑 getToken called");
    
    // Wait a bit for auth state to sync if needed
    let user = auth.currentUser;
    
    if (!user) {
        console.log("⚠️ No user found in auth.currentUser, waiting for auth state...");
        // Wait a short time for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500));
        user = auth.currentUser;
    }
    
    if (!user) {
        console.error("❌ No authenticated user found after waiting");
        throw new Error('No user found - please ensure you are logged in');
    }

    console.log("✅ User found, getting ID token...", user.uid);
    const token = await user.getIdToken();
    console.log("✅ Token retrieved successfully");
    return token;
}