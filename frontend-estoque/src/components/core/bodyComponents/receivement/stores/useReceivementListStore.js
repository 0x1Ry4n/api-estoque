import { create } from "zustand";
import { ReceivementService } from "../../../../../services/ReceivementService";
import { ProductService } from "../../../../../services/productService";
import { SupplierService } from "../../../../../services/supplierService";

export const useReceivementListStore = create((set, get) => ({
  rows: [],
  pagination: {
    page: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
  },
  products: [],
  suppliers: [],
  selectedReceivement: null,
  open: false,
  isEditing: true,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },

  setPagination: (pagination) => set({ pagination }),
  setSelectedReceivement: (receivement) => set({ selectedReceivement: receivement }),
  setOpen: (open) => set({ open }),
  setIsEditing: (isEditing) => set({ isEditing }),

  showSnackbar: (message, severity = "success") =>
    set({ snackbar: { open: true, message, severity } }),

  closeSnackbar: () =>
    set((state) => ({
      snackbar: { ...state.snackbar, open: false },
    })),

  fetchReceivements: async (page, pageSize) => {
    try {
      const res = await ReceivementService.getReceivements(true, page, pageSize);
      set({
        rows: res.data.content,
        pagination: {
          page: res.data.number,
          pageSize: res.data.size,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
        },
      });
    } catch (err) {
      get().showSnackbar(
        `Erro ao carregar recebimentos: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  },

  fetchProductsAndSuppliers: async () => {
    try {
      const [products, suppliers] = await Promise.all([
        ProductService.product.getProducts(false),
        SupplierService.getSuppliers(false)
      ]);
      set({ products: products.data, suppliers: suppliers.data });
    } catch {
      get().showSnackbar("Erro ao carregar produtos ou fornecedores", "error");
    }
  },

  openEditModal: (receivement = null) => {
    set({
      open: true,
      isEditing: !!receivement,
      selectedReceivement: receivement,
    });
  },

  closeModal: () => {
    set({
      open: false,
      isEditing: false,
      selectedReceivement: null,
    });
  },

  saveReceivement: async () => {
    const { selectedReceivement, pagination } = get();
    if (!selectedReceivement) return;

    try {
      const { id, ...data } = selectedReceivement;
      await ReceivementService.updateReceivement(id, data);
      get().showSnackbar("Recebimento atualizado com sucesso!");
      await get().fetchReceivements(pagination.page, pagination.pageSize);
    } catch (err) {
      get().showSnackbar(
        `Erro ao salvar recebimento: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      get().closeModal();
    }
  },

  updateStatus: async (id, status) => {
    try {
      await ReceivementService.updateStatus(id, status);
      get().showSnackbar("Status atualizado com sucesso!");
      const { page, pageSize } = get().pagination;
      await get().fetchReceivements(page, pageSize);
    } catch (err) {
      get().showSnackbar(
        `Erro ao atualizar status: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  },

  deleteReceivement: async (ids) => {
    if (!ids.length) return;
    try {
      await ReceivementService.deleteReceivement(ids);
      get().showSnackbar("Recebimento deletado com sucesso!");
      const { page, pageSize } = get().pagination;
      await get().fetchReceivements(page, pageSize);
    } catch (err) {
      get().showSnackbar(
        `Erro ao deletar recebimento: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
  },
}));
