import React from 'react'
import { Redirect } from "expo-router";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Redirect href="/(root)/introScreen1" />;

  return children;
}
