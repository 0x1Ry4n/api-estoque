import { create } from "zustand";
import { CategoryService } from "../../../../../services/categoryService";

export const useCategoryListStore = create((set, get) => ({
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
          const res = await CategoryService.getCategories(true, page, pageSize);
          
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
    isEditing: true,
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
      const { selectedCategory, pagination } = get();

      const { name } = selectedCategory;

      if (!selectedCategory?.name) {
        get().showSnackbar("Por favor, preencha o nome da categoria!", "error");
        return;
      }

      try {
        await CategoryService.updateCategory(selectedCategory.id, { name });
        get().showSnackbar("Categoria atualizada com sucesso!");
        get().fetchCategories(pagination.page, pagination.pageSize);
      } catch (error) {
        get().showSnackbar(
          `Erro ao salvar a categoria: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
          "error"
        );
      } finally {
        get().closeModal();
      }
    },

    deleteCategory: async (ids = []) => {
      const { pagination } = get();

      try {
        await CategoryService.deleteCategory(ids);

        get().showSnackbar("Categoria deletada com sucesso!");
        get().fetchCategories(pagination.page, pagination.pageSize);
      } catch (error) {
        get().showSnackbar(
          `Erro ao deletar a categoria: ${error.response?.data?.message || error.response?.data?.error || error.message}`,
          "error"
        );
      }
    },
}));
