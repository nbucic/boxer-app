import {supabase} from "@/lib/supabase";
import {Alert, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {useState} from "react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithEmail = async () => {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }

    setLoading(false);
  }

  const signUpWithEmail = async () => {
    setLoading(true);
    const {
      data: {session},
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    }

    if (!session) {
      Alert.alert('Please check your inbox for email verification');
    }

    setLoading(false);
  }

  return (
    <View className={'flex  bg-white'}>
      <View className={'px-10 pt-5'}>
        <TextInput
          className={'h-14 border border-slate-400 rounded-md px-3 mb-5'}
          placeholder={'Email'}
          value={email}
          onChangeText={setEmail}/>
      </View>
      <View>
        <TextInput
          placeholder={'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}/>
      </View>
      <View>
        <TouchableOpacity onPress={() => (signInWithEmail())}
                          className={'p-4 rounded-lg shadow-md w-2/5 items-center bg-blue-500'}
                          disabled={loading}
        >
          <Text className={'text-white font-bold'}>Sign in</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}