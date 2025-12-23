import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  GoogleAuthProvider,
} from 'firebase/auth';
import { createContext, useEffect, useState, ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '@/utils/firebase';

WebBrowser.maybeCompleteAuthSession();

/* =========================
   Types
========================= */

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  createAccountEmailPassword: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  loginEmailPassword: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: false,
  createAccountEmailPassword: async () => {},
  loginEmailPassword: async () => {},
  forgotPassword: async () => {},
  googleLogin: async () => {},
  logout: async () => {},
});

/* =========================
   Provider
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Google Auth Request ---------- */
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  /* ---------- Firebase Auth Listener ---------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* ---------- Handle Google OAuth Result ---------- */
  useEffect(() => {
    const signInWithGoogle = async () => {
      try {
        if (response?.type !== 'success') return;

        setLoading(true);

        const { id_token } = response.params;
        if (!id_token) throw new Error('Google ID token missing');

        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      } catch (err) {
        console.error('Google Sign-In Error:', err);
      } finally {
        setLoading(false);
      }
    };

    signInWithGoogle();
  }, [response]);

  /* ---------- Email / Password Signup ---------- */
  const createAccountEmailPassword = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      setLoading(true);

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: fullName });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Email / Password Login ---------- */
  const loginEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Forgot Password ---------- */
  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  /* ---------- Google Login Trigger ---------- */
  const googleLogin = async () => {
    if (!request) return;
    await promptAsync();
  };

  /* ---------- Logout ---------- */
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        createAccountEmailPassword,
        loginEmailPassword,
        forgotPassword,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
