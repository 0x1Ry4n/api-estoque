import api from "../api";

export const ProductService = {
    createProduct: async (data) =>
        api.post(`/products`, data),

    getProductById: async (productId) =>
        api.get(`/products/${productId}`),

    getImage: async (productId) =>
        api.get(`/products/${productId}/image`, {
            responseType: "blob",
        }),

    getProducts: async (paged = false, page, size) => {
        if (paged)
            return api.get(`/products?page=${page}&size=${size}`)
        else
            return api.get(`/products?paged=false`)
    },
    updateProduct: async (productId, data) =>
        api.patch(`/products/${productId}`, data),

    updateProductImage: async (productId, image) =>
        api.patch(`/products/${productId}/image`, image, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    deleteProduct: async (productId) =>
        api.delete(`/products/${productId}`)
};