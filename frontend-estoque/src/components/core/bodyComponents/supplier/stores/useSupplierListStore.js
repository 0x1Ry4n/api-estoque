import { create } from "zustand";
import api from "../../../../../api";

export const useSupplierListStore = create((set, get) => ({
    rows: [],
    pagination: {
        page: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
    },
    open: false,
    isEditing: false,
    selectedSupplier: null,
    snackbar: {
        open: false,
        message: "",
        severity: "success",
    },

    setPagination: (pagination) => set({ pagination }),

    showSnackbar: (message, severity = "success") =>
        set({ snackbar: { open: true, message, severity } }),

    closeSnackbar: () =>
        set((state) => ({ snackbar: { ...state.snackbar, open: false } })),

    setOpen: (open) => set({ open }),

    setIsEditing: (isEditing) => set({ isEditing }),

    setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

    fetchSuppliers: async (page, pageSize) => {
        try {
            const res = await api.get(`/supplier?page=${page}&size=${pageSize}`);
            set({
                rows: res.data.content,
                pagination: {
                    page: res.data.number,
                    pageSize: res.data.size,
                    totalElements: res.data.totalElements,
                    totalPages: res.data.totalPages,
                },
            });
        } catch (error) {
            get().showSnackbar(
                `Erro ao carregar fornecedores: ${error.response?.data?.message || error.message}`,
                "error"
            );
        }
    },

    saveSupplier: async () => {
        const { selectedSupplier, pagination } = get();
        if (
            !selectedSupplier?.socialReason ||
            !selectedSupplier?.cnpj ||
            !selectedSupplier?.communicationPreference
        ) {
            get().showSnackbar("Por favor, preencha todos os campos obrigatórios!", "warning");
            return;
        }

        try {
            await api.patch(`/supplier/${selectedSupplier.id}`, selectedSupplier);
            get().showSnackbar("Fornecedor atualizado com sucesso!");
            await get().fetchSuppliers(pagination.page, pagination.pageSize)
        } catch (error) {
            get().showSnackbar(
                `Erro ao salvar o fornecedor: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
                "error"
            );
        }
    },

    deleteSupplier: async (ids) => {
        const { pagination } = get();
        try {
            await api.delete(`/supplier/${ids[0]}`);
            get().showSnackbar("Fornecedor deletado com sucesso!");
            await get().fetchSuppliers(pagination.page, pagination.pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao deletar o fornecedor: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
                "error"
            );
        }
    },
}));
