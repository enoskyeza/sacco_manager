import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { saccoApi } from '../api';
import type { Sacco } from '../types';
import { useAuth } from '../hooks/useAuth';

interface SaccoContextType {
  saccos: Sacco[];
  currentSacco: Sacco | null;
  isLoadingSaccos: boolean;
  switchSacco: (saccoId: number) => void;
  refreshSaccos: () => void;
}

const SaccoContext = createContext<SaccoContextType | undefined>(undefined);

export const SaccoProvider = ({ children }: { children: ReactNode }) => {
  const [currentSaccoId, setCurrentSaccoId] = useState<number | null>(null);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Fetch user's SACCOs - ONLY if authenticated
  const { 
    data: saccos = [], 
    isLoading: isLoadingSaccos,
    refetch: refreshSaccos 
  } = useQuery({
    queryKey: ['my-saccos'],
    queryFn: saccoApi.getMySaccos,
    enabled: isAuthenticated && !isAuthLoading, // Only fetch once auth state is confirmed
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Fetch current SACCO details
  const { data: currentSacco = null } = useQuery({
    queryKey: ['sacco', currentSaccoId],
    queryFn: () => saccoApi.getSacco(currentSaccoId!),
    enabled: !!currentSaccoId,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentSaccoId(null);
    }
  }, [isAuthenticated]);

  // Set default SACCO when saccos load
  useEffect(() => {
    if (saccos.length > 0 && !currentSaccoId) {
      // Check localStorage for previously selected SACCO
      const savedSaccoId = localStorage.getItem('currentSaccoId');
      if (savedSaccoId) {
        const saccoExists = saccos.find(s => s.id === parseInt(savedSaccoId));
        if (saccoExists) {
          setCurrentSaccoId(parseInt(savedSaccoId));
          return;
        }
      }
      // Default to first SACCO
      setCurrentSaccoId(saccos[0].id);
    }
  }, [saccos, currentSaccoId]);

  const switchSacco = (saccoId: number) => {
    setCurrentSaccoId(saccoId);
    localStorage.setItem('currentSaccoId', saccoId.toString());
  };

  return (
    <SaccoContext.Provider
      value={{
        saccos,
        currentSacco,
        isLoadingSaccos,
        switchSacco,
        refreshSaccos,
      }}
    >
      {children}
    </SaccoContext.Provider>
  );
};

// Export context for use in hooks
export { SaccoContext };

// Custom hook to use sacco context
export const useSacco = () => {
  const context = useContext(SaccoContext);
  if (context === undefined) {
    throw new Error('useSacco must be used within a SaccoProvider');
  }
  return context;
};
