import { create } from "zustand";
import api from "../../../../../api";

export const useReceivementListStore = create((set, get) => ({
    rows: [],
    pagination: {
        page: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0
    },
    products: [],
    suppliers: [],
    selectedReceivement: null,
    open: false,
    isEditing: false,
    snackbar: {
        open: false,
        message: "",
        severity: "success"
    },

    setPagination: (pagination) => set({ pagination }),
    setSelectedReceivement: (receivement) => set({ selectedReceivement: receivement }),
    setOpen: (open) => set({ open }),
    setIsEditing: (isEditing) => set({ isEditing }),

    showSnackbar: (message, severity = "success") =>
        set({ snackbar: { open: true, message, severity } }),
    closeSnackbar: () =>
        set((state) => ({ snackbar: { ...state.snackbar, open: false } })),

    fetchReceivements: async (page, pageSize) => {
        try {
            const res = await api.get(`/receivements?page=${page}&size=${pageSize}`);
            set({
                rows: res.data.content,
                pagination: {
                    page: res.data.number,
                    pageSize: res.data.size,
                    totalElements: res.data.totalElements,
                    totalPages: res.data.totalPages
                }
            });
        } catch (error) {
            get().showSnackbar(
                `Erro ao carregar recebimentos: ${error.response?.data?.message || error.message}`,
                "error"
            );
        }
    },

    fetchProductsAndSuppliers: async () => {
        try {
            const [prodRes, supRes] = await Promise.all([
                api.get("/products?paged=false"),
                api.get("/supplier?paged=false"),
            ]);
            set({ products: prodRes.data, suppliers: supRes.data });
        } catch (err) {
            get().showSnackbar("Erro ao carregar produtos ou fornecedores", "error");
        }
    },

    openEditModal: (receivement = null) => {
        set({
            open: true,
            isEditing: !!receivement,
            selectedReceivement: receivement
        });
    },

    closeModal: () => {
        set({
            open: false,
            isEditing: false,
            selectedReceivement: null
        });
    },

    saveReceivement: async () => {
        const {
            selectedReceivement,
            isEditing,
            pagination: { page, pageSize },
        } = get();

        if (!selectedReceivement) return;

        try {
            if (isEditing) {
                await api.patch(`/receivements/${selectedReceivement.id}`, {
                    description: selectedReceivement.description,
                    quantity: selectedReceivement.quantity,
                    supplierId: selectedReceivement.supplierId,
                    productId: selectedReceivement.productId,
                    status: selectedReceivement.status,
                    receivingDate: selectedReceivement.receivingDate,
                });
                get().showSnackbar("Recebimento atualizado com sucesso!");
            } else {
                await api.post("/receivements", {
                    description: selectedReceivement.description,
                    quantity: selectedReceivement.quantity,
                    supplierId: selectedReceivement.supplierId,
                    productId: selectedReceivement.productId,
                    receivingDate: selectedReceivement.receivingDate,
                });
                get().showSnackbar("Recebimento criado com sucesso!");
            }
            await get().fetchReceivements(page, pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao salvar o recebimento: ${error.response?.data?.message || error.message}`,
                "error"
            );
        } finally {
            get().closeModal();
        }
    },

    saveStatus: async (id, status) => {
        const {
            pagination: { page, pageSize },
        } = get();

        try {
            await api.patch(`/receivements/${id}/status`, { status });
            get().showSnackbar("Status atualizado com sucesso!");
            await get().fetchReceivements(page, pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao atualizar o status: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
                "error"
            );
        }
    },

    deleteReceivement: async (ids = []) => {
        const {
            pagination: { page, pageSize },
        } = get();

        try {
            await api.delete(`/receivements/${ids[0]}`);
            get().showSnackbar("Recebimento deletado com sucesso!");
            await get().fetchReceivements(page, pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao deletar o recebimento: ${error.response?.data?.message || error.message}`,
                "error"
            );
        }
    }
}));