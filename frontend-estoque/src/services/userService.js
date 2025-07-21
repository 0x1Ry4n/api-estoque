import api from "../api";

export const UserService = {
    createUser: async (data) => 
        api.post(`/auth/register/user`, data), 

    login: async (data) =>
        api.post(`/auth/login`, data),

    getMe: async () => 
        api.get(`/auth/me`), 

    getUsers: async () => 
        api.get(`/auth/users`), 

    getUserImage: async (userId) => 
        api.get(`/auth/users/${userId}/image`, { responseType: 'blob' }),

    updateUser: async (userId, data) =>
        api.patch(`/auth/users/${userId}`, data), 

    updateStatus: async (userId, status) =>
        api.patch(`/auth/users/${userId}/status`, status), 

    updatePassword: async (userId, password) => 
        api.patch(`/auth/users/${userId}/password`, password), 

    updateImage: async (userId, data) => 
        api.patch(`/auth/users/${userId}/image`, data)
};