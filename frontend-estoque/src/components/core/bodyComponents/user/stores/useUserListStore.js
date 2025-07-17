import { create } from "zustand";
import api from "../../../../../api";

const roleMap = {
  ADMIN: "Administrador",
  USER: "Usuário Comum",
};

const statusMap = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
};

export const useUserListStore = create((set, get) => ({
  rows: [],
  open: false,
  isEditing: false,
  selectedUser: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },

  setOpen: (open) => set({ open }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setSelectedUser: (user) => set({ selectedUser: user }),

  showSnackbar: (message, severity = "success") =>
    set({ snackbar: { open: true, message, severity } }),

  closeSnackbar: () =>
    set((state) => ({ snackbar: { ...state.snackbar, open: false } })),

  fetchUsers: async () => {
    try {
      const res = await api.get(`/auth/users`);
      const formatted = res.data.map((user) => ({
        ...user,
        role: roleMap[user.role] || user.role,
        status: statusMap[user.status] || user.status,
      }));
      set({ rows: formatted });
    } catch (error) {
      get().showSnackbar(
        `Erro ao carregar os usuários: ${error.response?.data?.message || error.message}`,
        "error"
      );
    }
  },

  saveUser: async (id, data) => {
    try {
      await api.put(`/auth/users/${id}`, data);
      get().showSnackbar("Usuário atualizado com sucesso!");
      get().fetchUsers();
    } catch (error) {
      get().showSnackbar(
        `Erro ao atualizar usuário: ${error.response?.data?.message || error.message}`,
        "error"
      );
    }
  },

  saveStatus: async (id, status) => {
    try {
      await api.patch(`/auth/users/${id}/status`, status);
      get().showSnackbar("Status atualizado com sucesso!");
      get().fetchUsers();
    } catch (error) {
      get().showSnackbar(
        `Erro ao atualizar status: ${error.response?.data?.message || error.message}`,
        "error"
      );
    }
  },

  savePassword: async (id, password) => {
    try {
      await api.patch(`/auth/users/${id}/password`, password);
      get().showSnackbar("Senha atualizada com sucesso!");
      get().fetchUsers();
    } catch (error) {
      get().showSnackbar(
        `Erro ao atualizar senha: ${error.response?.data?.message || error.message}`,
        "error"
      );
    }
  },
}));
