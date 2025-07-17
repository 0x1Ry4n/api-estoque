import { create } from "zustand";
import api from "../../../../../api";

export const useExitListStore = create((set, get) => ({
    rows: [],
    pagination: {
        page: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0
    },
    setPagination: (newPagination) => set({ pagination: newPagination }),
    fetchExits: async (page, pageSize) => {
        try {
            const res = await api.get(`/exits?page=${page}&size=${pageSize}`);
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
                `Erro ao carregar as saídas: ${error.response?.data?.message || error.response?.data?.error || error.message}`, 
                "error"
            );
        }
    },
    saveExit: async () => {
        const { selectedExit, pagination } = get();

        try {
            await api.patch(`/exits/${selectedExit.id}`, {
                quantity: selectedExit.quantity,
                exitDate: selectedExit.exitDate,
            });
            get().showSnackbar("Saída atualizada com sucesso");
            await get().fetchExits(pagination.page, pagination.pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao salvar a saída: ${error.response?.data?.message || error.response?.data?.error || error.message}`, 
                "error"
            );
        } finally {
            get().closeModal();
        }
    },
    saveStatus: async (id, status) => {
        const { pagination } = get();

        try {
            await api.patch(`/exits/${id}/status`, { status: status });
            get().showSnackbar(`Status atualizado com sucesso!`);
            await get().fetchExits(pagination.page, pagination.pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao atualizar o status: ${error.response?.data?.message || error.response?.data?.error || error.message}`, 
                "error"
            );
        } finally {
            setSnackbarOpen(true);
        }
    },
    deleteExit: async (ids = []) => {
        const { pagination } = get();

        try {
            await api.delete(`/exits/${ids}`);
            get().showSnackbar("Saída deletada com sucesso!", "success");
            await get().fetchExits(pagination.page, pagination.pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao deletar a saída: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
                "error"
            );
        }
    },
    snackbar: {
        open: false,
        message: "",
        severity: "success"
    },
    showSnackbar: (message, severity = "success") =>
        set({ snackbar: { open: true, message, severity } }),
    closeSnackbar: () =>
        set((state) => ({ snackbar: { ...state.snackbar, open: false } })),
    open: false,
    isEditing: true,
    selectedExit: null,
    openModal: (exit = null) =>
        set({
            open: true,
            isEditing: !!exit,
            selectedExit: exit || null,
        }),
    closeModal: () =>
        set({
            open: false,
            isEditing: false,
            selectedExit: null
        })
}));