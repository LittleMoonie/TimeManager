import { create } from 'zustand';

import { getOrganization, updateOrganizationSettings } from '@/api/adminApi';
import type { Organization } from '@/types';

interface OrgState {
  organization: Organization | null;
  loading: boolean;
  load: () => Promise<void>;
  updateSettings: (settings: Partial<Organization['settings']>) => Promise<void>;
}

export const useOrgStore = create<OrgState>((set) => ({
  organization: null,
  loading: false,
  load: async () => {
    set({ loading: true });
    try {
      const organization = await getOrganization();
      set({ organization });
    } finally {
      set({ loading: false });
    }
  },
  updateSettings: async (settings) => {
    set({ loading: true });
    try {
      const organization = await updateOrganizationSettings(settings);
      set({ organization });
    } finally {
      set({ loading: false });
    }
  },
}));
