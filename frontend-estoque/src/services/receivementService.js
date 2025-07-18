import api from '../api';

export const ReceivementService = {
    createReceivement: async (data) =>
        api.post(`/receivements`, data),

    getReceivementById: async (receivementId) =>
        api.get(`/receivement/${receivementId}`),

    getReceivements: async (paged = false, page = 0, size = 0) => {
        if (paged)
            return api.get(`/receivements?page=${page}&size=${size}`)
        else 
            return api.get(`/receivements?paged=false`)
    },

    updateReceivement: async (id, data) =>
        api.patch(`/receivements/${id}`, data),

    updateStatus: async (id, status) =>
        api.patch(`/receivements/${id}/status`, { status }),

    deleteReceivement: async (id) =>
        api.delete(`/receivements/${id}`),
};
