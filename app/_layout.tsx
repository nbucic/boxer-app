import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import './global.css';
import { Stack, useRouter, useSegments } from "expo-router";

// Custom hook to manage session and navigation
function useProtectedRoute(session: Session | null) {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const inAuthGroup = segments[0] === '(auth)';

        // Redirect to the main app if the user is signed in and is on a page in the auth group
        if (session && inAuthGroup) {
            router.replace('/(tabs)');
        } else if (!session && !inAuthGroup) {
            // Redirect to the auth page if the user is not signed in and not on a page in the auth group
            router.replace('/(auth)/Auth');
        }
    }, [session, segments, router]);
}

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useProtectedRoute(session);

    return (
        <GluestackUIProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)/Auth" />
            </Stack>
        </GluestackUIProvider>
    );
}
