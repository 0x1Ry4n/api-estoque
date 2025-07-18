import api from "../api";

export const SupplierService = {
    createSupplier: async (data) =>
        api.post(`/supplier`, data),

    getSupplierById: async (supplierId) =>
        api.get(`/supplier/${supplierId}`),

    getSuppliers: async (paged = false, page = 0, size = 0) => {
        if (paged)
            return api.get(`/supplier?page=${page}&size=${size}`)
        else
            return api.get(`/supplier?paged=false`)
    },

    updateSupplier: async (supplierId, data) =>
        api.patch(`/supplier/${supplierId}`, data),

    deleteSupplier: async (supplierId) =>
        api.delete(`/supplier/${supplierId}`)
};