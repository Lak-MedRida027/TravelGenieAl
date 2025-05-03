import React, { createContext, useContext, ReactNode } from 'react';

interface APIKeyContextType {
  isKeySet: boolean;
  isSerpApiKeySet: boolean;
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined);

export const useAPIKey = (): APIKeyContextType => {
  const context = useContext(APIKeyContext);
  if (!context) {
    throw new Error('useAPIKey must be used within an APIKeyProvider');
  }
  return context;
};

interface APIKeyProviderProps {
  children: ReactNode;
}

export const APIKeyProvider: React.FC<APIKeyProviderProps> = ({ children }) => {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const serpApiKey = import.meta.env.VITE_SERPAPI_KEY;

  const value = {
    isKeySet: geminiKey !== undefined && geminiKey !== 'YOUR_GEMINI_API_KEY',
    isSerpApiKeySet: serpApiKey !== undefined && serpApiKey !== 'YOUR_SERPAPI_KEY',
  };

  return (
    <APIKeyContext.Provider value={value}>
      {children}
    </APIKeyContext.Provider>
  );
};