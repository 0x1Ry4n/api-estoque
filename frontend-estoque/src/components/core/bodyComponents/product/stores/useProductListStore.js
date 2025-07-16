import { create } from "zustand";
import api from "../../../../../api";

export const useProductListStore = create((set, get) => ({
    rows: [],
    pagination: {
        page: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
    },
    categories: [],
    suppliers: [],
    selectedProduct: null,
    detailedProduct: null,
    imageEdit: null,
    imagePreviewEdit: null,
    open: false,
    isEditing: false,
    detailDialogOpen: false,
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

    setImageEdit: (image) =>
        set({
            imageEdit: image,
            imagePreviewEdit: image ? URL.createObjectURL(image) : null,
        }),

    fetchProducts: async (page, pageSize) => {
        try {
            const res = await api.get(`/products?page=${page}&size=${pageSize}`);
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
                `Erro ao carregar produtos: ${error.response?.data?.message || error.message}`,
                "error"
            );
        }
    },
    fetchCategoriesAndSuppliers: async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                api.get("/category?paged=false"),
                api.get("/supplier?paged=false"),
            ]);
            set({ categories: catRes.data, suppliers: supRes.data });
        } catch (err) {
            get().showSnackbar("Erro ao carregar categorias ou fornecedores", "error");
        }
    },
    openModal: async (product = null) => {
        const isEditing = !!product;
        let imagePreviewEdit = null;

        if (product) {
            try {
                const res = await api.get(`/products/${product.id}/image`, {
                    responseType: "blob",
                });
                imagePreviewEdit = URL.createObjectURL(res.data);
            } catch (err) {
                if (err?.response?.status !== 404) {
                    get().showSnackbar("Erro ao carregar imagem do produto", "error");
                }
            }
        }

        set({
            open: true,
            isEditing,
            selectedProduct: product,
            imageEdit: null,
            imagePreviewEdit,
        });
    },
    closeModal: () =>
        set({
            open: false,
            isEditing: false,
            selectedProduct: null,
            imageEdit: null,
            imagePreviewEdit: null,
        }),

    openDetailDialog: async (id) => {
        try {
            const res = await api.get(`/products/${id}`);
            set({ detailedProduct: res.data, detailDialogOpen: true });
        } catch (err) {
            get().showSnackbar("Erro ao carregar detalhes do produto", "error");
        }
    },

    closeDetailDialog: () => set({ detailDialogOpen: false }),

    saveProduct: async () => {
        const {
            selectedProduct,
            imageEdit,
            pagination: { page, pageSize },
        } = get();

        if (!selectedProduct) return;

        try {
            const productToSave = {
                ...selectedProduct,
                price: selectedProduct.unitPrice,
            };

            if (imageEdit) {
                const formData = new FormData();
                formData.append("file", imageEdit);
                await api.patch(`/products/${selectedProduct.id}/image`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            await api.patch(`/products/${selectedProduct.id}`, productToSave);
            get().showSnackbar("Produto atualizado com sucesso!");
            await get().fetchProducts(page, pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao salvar o produto: ${error.response?.data?.message || error.message}`,
                "error"
            );
        } finally {
            get().closeModal();
        }
    },

    deleteProduct: async (ids = []) => {
        const {
            pagination: { page, pageSize },
        } = get();

        try {
            await api.delete(`/products/${ids[0]}`);
            get().showSnackbar("Produto deletado com sucesso!");
            await get().fetchProducts(page, pageSize);
        } catch (error) {
            get().showSnackbar(
                `Erro ao deletar o produto: ${error.response?.data?.message || error.message}`,
                "error"
            );
        }
    },
}));
