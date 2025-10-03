import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase";
import {View} from "react-native";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  }, []);

  return (
    <View>

    </View>
  )
}