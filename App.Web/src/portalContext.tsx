import { createContext, useContext } from 'react';

interface PortalContextValue {
  activeTeamId: 'all' | string;
  setActiveTeamId: (teamId: 'all' | string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const defaultValue: PortalContextValue = {
  activeTeamId: 'all',
  setActiveTeamId: () => undefined,
  searchTerm: '',
  setSearchTerm: () => undefined,
};

const PortalContext = createContext<PortalContextValue>(defaultValue);

export const usePortalContext = () => useContext(PortalContext);

export { PortalContext };
