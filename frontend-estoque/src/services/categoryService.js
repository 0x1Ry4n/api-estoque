import api from "../api";

export const CategoryService = {
    createCategory: async (data) =>
        api.post(`/category`, data),

    getCategoryById: async (categoryId) =>
        api.get(`/category/${categoryId}`),

    getCategories: async (paged = false, page = 0, size = 0) => {
        if (paged) 
            return api.get(`/category?page=${page}&size=${size}`)
        else 
            return api.get(`/category?paged=false`)
    },

    updateCategory: async (categoryId, data) =>
        api.patch(`/category/${categoryId}`, data), 

    deleteCategory: async (categoryId) =>
        api.delete(`/category/${categoryId}`)
}