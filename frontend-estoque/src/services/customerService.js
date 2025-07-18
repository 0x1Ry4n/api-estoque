import api from "../api";

export const CustomerService = {
    createCustomer: async (data) =>
        api.post(`/customer`, data),

    getCustomerById: async (customerId) =>
        api.get(`/customer/${customerId}`),

    getCustomer: async (paged = false, page = 0, size = 0) => {
        if (paged) 
            return api.get(`/customer?page=${page}&size=${size}`)
        else 
            return api.get(`/customer?paged=false`)
    },

    updateCustomer: async (customerId, data) =>
        api.patch(`/customer/${customerId}`, data),
}