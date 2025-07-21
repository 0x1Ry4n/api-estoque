import { create } from "zustand";
import { ProductService } from "../../../../../services/productService";
import { CategoryService } from "../../../../../services/CategoryService";
import { SupplierService } from "../../../../../services/supplierService";

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
            const res = await ProductService.product.getProducts(true, page, pageSize);
            
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
                CategoryService.getCategories(false),
                SupplierService.getSuppliers(false),
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
                const res = await ProductService.product.getImage(product.id);
                
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
            const res = await ProductService.product.getProductById(id);
            
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

                await ProductService.product.updateProductImage(selectedProduct.id, formData);
            }

            await ProductService.product.updateProduct(selectedProduct.id, productToSave);
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
            await ProductService.product.deleteProduct(ids);
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
