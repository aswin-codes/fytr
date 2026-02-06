import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{animation : "slide_from_right", headerShown : false}}>
            <Stack.Screen name="introScreen1"  />
            <Stack.Screen name="introScreen2"  />
            <Stack.Screen name="GetStartedScreen"  />
            <Stack.Screen name="CreateAccountScreen"  />
            <Stack.Screen name="LoginScreen"  />
            <Stack.Screen name="ForgotPassword"  />
            <Stack.Screen name="ChangePasswordScreen"  />                                                                   
        </Stack>
    );
}