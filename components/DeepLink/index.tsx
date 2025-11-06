import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getDeepLink = (link: string) => {
  if (Platform.OS === 'web') {
    return `http://localhost:8081/${link}`;
  }

  const scheme = Constants.expoConfig?.scheme;

  if (Constants.executionEnvironment === 'storeClient') {
    // Running in Expo Go, we need to construct the exp:// URL
    const manifest = Constants.manifest2;
    // The hostUri includes the IP and port, e.g. "192.168.1.10:8081"
    const hostUri = manifest?.extra?.expoClient?.hostUri;

    if (hostUri) {
      return `exp://${hostUri}/--/${link}`;
    }
  }

  return `${scheme}://${link}`;
};
