import api from '../api';

export const OrderService = {
    createOrder: async (data) =>
        api.post(`/orders`, data),

    getOrderByOrderNumber: async (orderNumber) =>
        api.get(`/orders/${orderNumber}`),

    getOrders: async (paged = false, page = 0, size = 0) => {
        if (paged)
            return api.get(`/orders?page=${page}&size=${size}`)
        else
            return api.get(`/orders?paged=false`)
    },

    updateOrder: async (orderNumber, data) =>
        api.patch(`/orders/${orderNumber}`, data)
}