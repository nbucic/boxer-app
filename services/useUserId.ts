import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Needed for uuid
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'userId';

export const useUserId = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                let storedId: string | null = null;

                if (Platform.OS === 'web') {
                    storedId = localStorage.getItem(USER_ID_KEY);
                } else {
                    storedId = await AsyncStorage.getItem(USER_ID_KEY);
                }

                if (storedId) {
                    setUserId(storedId);
                } else {
                    const newId = uuidv4();
                    if (Platform.OS === 'web') {
                        localStorage.setItem(USER_ID_KEY, newId);
                    } else {
                        await AsyncStorage.setItem(USER_ID_KEY, newId);
                    }
                    setUserId(newId);
                }
            } catch (error) {
                console.error("Failed to load user ID", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserId();
    }, []);

    return { userId, loading };
};
