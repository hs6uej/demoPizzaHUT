import React, { useEffect, useState, createContext, useContext } from 'react';
import { generateToken, ensureToken } from '../services/api';
interface ApiContextType {
  token: string | null;
  loading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
}
const ApiContext = createContext<ApiContextType>({
  token: null,
  loading: false,
  error: null,
  refreshToken: async () => {}
});
export const useApi = () => useContext(ApiContext);
interface ApiProviderProps {
  children: ReactNode;
}
export const ApiProvider: React.FC<ApiProviderProps> = ({
  children
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const refreshToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const newToken = await generateToken();
      setToken(newToken);
    } catch (err) {
      setError('Failed to generate token');
      console.error('Error refreshing token:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const initializeToken = async () => {
      try {
        setLoading(true);
        const existingToken = await ensureToken();
        setToken(existingToken);
      } catch (err) {
        setError('Failed to initialize API token');
        console.error('Error initializing token:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeToken();
  }, []);
  return <ApiContext.Provider value={{
    token,
    loading,
    error,
    refreshToken
  }}>
      {children}
    </ApiContext.Provider>;
};