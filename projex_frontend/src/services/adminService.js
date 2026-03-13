import api from './api';

const adminService = {
  // Récupérer les utilisateurs en attente d'activation
  getPendingUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des utilisateurs' };
    }
  },

  // Activer un utilisateur avec un rôle final
  activateUser: async (userId, roleFinal) => {
    try {
      const response = await api.post('/admin/users/activate', {
        user_id: userId,
        role_final: roleFinal,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'activation' };
    }
  },

  // Récupérer tous les projets
  getProjects: async () => {
    try {
      const response = await api.get('/admin/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des projets' };
    }
  },

  // Créer un nouveau projet
  createProject: async (projectData) => {
    try {
      const response = await api.post('/admin/projects/create', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création du projet' };
    }
  },

  // Assigner un projet à des utilisateurs
  assignProject: async (projectId, userIds) => {
    try {
      const response = await api.post('/admin/projects/assign', {
        project_id: projectId,
        user_ids: userIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'assignation' };
    }
  },
};

export default adminService;
