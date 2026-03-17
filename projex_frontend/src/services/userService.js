import api from './api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    },

    updatePassword: async (oldPassword, newPassword) => {
        const response = await api.put('/user/password', {
            old_password: oldPassword,
            new_password: newPassword
        });
        return response.data;
    },

    uploadAvatar: async (formData) => {
        const response = await api.post('/user/avatar', formData);
        return response.data;
    }
};

export default userService;
