import { create } from "zustand";
import api from "../../../../../api";

export const useCategoryStore = create((set, get) => ({
  rows: [],
  fetchCategories: async () => {
    try {
      const res = await api.get("/category");
      set({ rows: res.data.content });
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
      fetchCategories();
    } catch (error) {
      showSnackbar(
        `Erro ao salvar a categoria: ${
          error.response?.data?.error || error.message
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
      fetchCategories();
    } catch (error) {
      showSnackbar(
        `Erro ao deletar a categoria: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    }
  },
}));
