import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { createContext, useEffect, useState } from "react";
import React from "react"
import { auth } from "@/src/utils/firebase";

interface authContextProps {
    user : User | null;
    loading: boolean;
    createAccountEmailPassword:  (email: string, password : string, fullName : string) => Promise<void>;
    loginEmailPassword : (email : string, password : string) => Promise<void>;
    forgotPassword : (email : string) => Promise<void>;
    googleLogin : () => Promise<string|null>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<authContextProps>({user : null, loading : false, createAccountEmailPassword : async () => {}, loginEmailPassword : async () => {}, forgotPassword : async () => {}, googleLogin : async () => "", logout : async () => {}});

export function AuthProvider({children} : any) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            console.log('user : ', JSON.stringify(user?.toJSON()));
            setUser(user);
            setLoading(false);
        });

        GoogleSignin.configure({
            webClientId: "483871924522-8skmhgg3eudshmhv4gg5d3nr0gk73une.apps.googleusercontent.com"
        })
        
        console.log("Google Signin Configured");
        return unsub;
    },[])

    const createAccountEmailPassword = async (email : string, password : string, fullName : string) => {
        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth,email, password);
            const user = userCredential.user;
            await updateProfile(user, {
                displayName : fullName
            });
            console.log(userCredential.user.getIdToken())
            console.log("Account created with email and password");
        } catch (error : any) {
            console.log("Error creating account : ", error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            await GoogleSignin.signOut();
            console.log("User signed out");
        } catch (error : any) {
            console.log("Error signing out : ", error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const loginEmailPassword = async (email : string, password : string) => {
        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth,email, password);
            const user = userCredential.user;
            console.log(await user.getIdToken());
            console.log("User signed in");
        } catch (error : any) {
            console.log("Error signing in : ", error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const forgotPassword = async (email : string) => {
        try {
            setLoading(true);
            await sendPasswordResetEmail(auth,email);
            console.log("Password reset email sent");
        } catch (error : any) {
            console.log("Error sending password reset email : ", error.message);

            throw error;
        } finally {
            setLoading(false);
        }
    }

    const googleLogin = async () => {
        try {
            setLoading(true);
            const result = await GoogleSignin.signIn();
            const idToken = result.data?.idToken;
            if (!idToken) {
                throw new Error("ID token not found");
            }
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            console.log("User signed in");
          return user.displayName;
        } catch (error : any) {
            console.log("Error signing in : ", error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{user, loading, createAccountEmailPassword, loginEmailPassword, logout, forgotPassword, googleLogin}}>
            {children}
        </AuthContext.Provider>
    )
}