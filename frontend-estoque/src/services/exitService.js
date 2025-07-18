import api from "../api";

export const ExitService = {
    createExit: async (data) =>
        api.post(`/exits`, data),

    getExitById: async (exitId) =>
            api.get(`/exit/${exitId}`),

    getExits: async (paged = false, page = 0, size = 0) => {
        if (paged)
            return api.get(`/exits?page=${page}&size=${size}`)
        else
            return api.get(`/exits?paged=false`)
    },

    updateExit: async (exitId, data) =>
        api.patch(`/exits/${exitId}`, data),

    updateStatus: async (exitId, status) =>
        api.patch(`/exits/${exitId}/status`, status),

    deleteExit: async (exitId) =>
        api.delete(`/exits/${exitId}`)
}