import axios from '../utils/axios';

const notificationService = {
  /**
   * Récupère toutes les notifications de l'utilisateur
   */
  getNotifications: async () => {
    try {
      const response = await axios.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead: async () => {
    try {
      const response = await axios.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer une notification
   */
  delete: async (id) => {
    try {
      const response = await axios.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Supprimer toutes les notifications
   */
  deleteAll: async () => {
    try {
      const response = await axios.delete('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default notificationService;
