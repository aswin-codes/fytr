import { Stack } from "expo-router";
import ProtectedRoute from "@/src/auth/protectedRoutes";

export default function AppLayout() {
    return (
        <ProtectedRoute>
            <Stack screenOptions={{animation : "slide_from_right", headerShown : false}}>
                <Stack.Screen name="homeScreen" options={{headerShown : false}} />
            </Stack>
        </ProtectedRoute>
    );
}