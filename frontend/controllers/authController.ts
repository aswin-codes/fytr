import { registerUser, loginUser , loginUserWithGoogle} from "@/api/userClient";
import { userStorage } from "@/store/userStorage";

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

        return response;
    } catch (error) {
        console.error("Error in registerEmailAndPassword:", error);
        throw error;
    }
}

export const loginUserWithEmailAndPassword = async (email: string, password: string, loginEmailPassword : (email : string, password : string) => Promise<void>) => {
    try {
        console.log("🔵 Step 1: Logging in with email and password...");
        await loginEmailPassword(email, password);
        console.log("✅ Step 1 Complete: Login successful");

        console.log("🔵 Step 2 : Calling the backend API to login user...")
        const response = await loginUser({ email, password });
        console.log("✅ Step 2 Complete: Backend API response:", response);

        console.log("🔵 Step 3: Saving user to storage...");
        userStorage.saveUser(response.user);
        console.log("✅ Step 3 Complete: User saved to storage");   

        return response;
    } catch (error) {
        console.error("   Error in loginEmailAndPassword:", error);
        throw error;
    }
}

export const loginWithGoogle = async ( googleLogin: () => Promise<string|null>) => {
    try {
        console.log("🔵 Step 1: Logging in with Google...");
        const fullName= await googleLogin();
        console.log("✅ Step 1 Complete: Login successful");

        console.log("🔵 Step 2 : Calling the backend API to login user...")
        const response = await loginUserWithGoogle({ full_name: fullName || "" });
        console.log("✅ Step 2 Complete: Backend API response:", response);

        console.log("🔵 Step 3: Saving user to storage...");
        userStorage.saveUser(response.user);
        console.log("✅ Step 3 Complete: User saved to storage");   

        return response;
    } catch (error) {
        console.error("Error in loginWithGoogle:", error);
        throw error;
    }
}
