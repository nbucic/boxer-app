import React, { createContext, useContext, ReactNode } from 'react';
import { useUserId } from './useUserId';

interface UserIdContextType {
    userId: string | null;
    loading: boolean;
}

const UserIdContext = createContext<UserIdContextType | undefined>(undefined);

export const UserIdProvider = ({ children }: { children: ReactNode }) => {
    const { userId, loading } = useUserId();

    return (
        <UserIdContext.Provider value={{ userId, loading }}>
            {children}
        </UserIdContext.Provider>
    );
};

export const useUserIdContext = () => {
    const context = useContext(UserIdContext);
    if (context === undefined) {
        throw new Error('useUserIdContext must be used within a UserIdProvider');
    }
    return context;
};
