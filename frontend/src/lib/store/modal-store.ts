import { create } from 'zustand';

interface ModalState {
  isCreateOrgModalOpen: boolean;
  openCreateOrgModal: () => void;
  closeCreateOrgModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreateOrgModalOpen: false,
  openCreateOrgModal: () => set({ isCreateOrgModalOpen: true }),
  closeCreateOrgModal: () => set({ isCreateOrgModalOpen: false }),
})); 