import { create } from "zustand";
import api from "../../../../../api";

export const useCategoryStore = create((set, get) => ({
  rows: [],
  pagination: {
    page: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0
  },
  setPagination: (newPagination) => set({ pagination: newPagination }),
  fetchCategories: async (page, pageSize) => {
    try {
      const res = await api.get(`/category?page=${page}&size=${pageSize}`);
      set({
        rows: res.data.content,
        pagination: {
          page: res.data.number,
          pageSize: res.data.size,
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages
        }
      });
    } catch (err) {
      get().showSnackbar("Erro ao carregar categorias.", "error");
    }
  },
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
  showSnackbar: (message, severity = "success") =>
    set({ snackbar: { open: true, message, severity } }),
  closeSnackbar: () =>
    set((state) => ({ snackbar: { ...state.snackbar, open: false } })),
  open: false,
  isEditing: false,
  selectedCategory: null,
  openModal: (category = null) =>
    set({
      open: true,
      isEditing: !!category,
      selectedCategory: category || { name: "" },
    }),
  closeModal: () =>
    set({
      open: false,
      isEditing: false,
      selectedCategory: null,
    }),
  updateCategoryField: (field, value) =>
    set((state) => ({
      selectedCategory: {
        ...state.selectedCategory,
        [field]: value,
      },
    })),

  saveCategory: async () => {
    const { selectedCategory, isEditing, fetchCategories, showSnackbar, closeModal } = get();

    if (!selectedCategory?.name) {
      showSnackbar("Por favor, preencha o nome da categoria!", "error");
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/category/${selectedCategory.id}`, {
          name: selectedCategory.name,
        });
        showSnackbar("Categoria atualizada com sucesso!", "success");
      } else {
        await api.post("/category", { name: selectedCategory.name });
        showSnackbar("Categoria adicionada com sucesso!", "success");
      }
      const { pagination } = get();
      fetchCategories(pagination.page, pagination.pageSize);
    } catch (error) {
      showSnackbar(
        `Erro ao salvar a categoria: ${error.response?.data?.error || error.message
        }`,
        "error"
      );
    } finally {
      closeModal();
    }
  },

  deleteCategory: async (id) => {
    const { fetchCategories, showSnackbar } = get();
    try {
      await api.delete(`/category/${id}`);
      showSnackbar("Categoria deletada com sucesso!", "success");
      
      const { pagination } = get();
      fetchCategories(pagination.page, pagination.pageSize);
    } catch (error) {
      showSnackbar(
        `Erro ao deletar a categoria: ${error.response?.data?.error || error.message
        }`,
        "error"
      );
    }
  },
}));
