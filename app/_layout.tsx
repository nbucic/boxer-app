import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase";
import Auth from "@/app/(auth)/Auth";
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';
import './global.css';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    })
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
    return () => subscription.unsubscribe();
  }, []);

  return (
    <GluestackUIProvider>
      {session?.user ? <></> : <Auth/>}
    </GluestackUIProvider>
  )
}