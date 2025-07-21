import { create } from "zustand";
import { ProductService } from "../../../../../services/productService";

export const useInventoryListStore = create((set, get) => ({
    rows: [],
    pagination: {
        page: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0
    },
    products: [],
    setPagination: (newPagination) => set({ pagination: newPagination }),
    fetchInventories: async (page, pageSize) => {
        try {
            const res = await ProductService.inventory.getInventories(page, pageSize);
            set({
                rows: res.data.content,
                pagination: {
                    page: res.data.number,
                    pageSize: res.data.size,
                    totalElements: res.data.totalElements,
                    totalPages: res.data.totalPages
                }
            })
        } catch (error) {
            get().showSnackbar("Erro ao carregar os inventários.", "error");
        }
    },
    fetchProducts: async () => {
        try {
            const res = await ProductService.product.getProducts(false, 0, 0);
            set({
                products: res.data || []
            });
        } catch (error) {
            get().showSnackbar(
                `Erro ao carregar os produtos: ${error.response?.data?.message || error.response?.data?.error || error.message}`, 
                "error"
            );
        }
    },
    deleteInventory: async (inventories) => {
        const { pagination } = get();

        try {
            await ProductService.inventory.deleteInventory(inventories[0].productId, inventories[0].id);
            get().showSnackbar("Item de inventário deletado com sucesso!");
            get().fetchInventories(pagination.page, pagination.pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao deletar o inventário: ${error.response?.data?.message || error.response?.data?.error || error.message}`, 
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
    selectedInventory: null,
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