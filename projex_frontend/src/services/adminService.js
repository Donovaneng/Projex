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

  // Récupérer l'intégralité des utilisateurs (actifs et inactifs)
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération de tous les utilisateurs' };
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

  // Modifier un projet
  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/admin/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la modification du projet' };
    }
  },

  // Supprimer un projet
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/admin/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du projet' };
    }
  },

  // Approuver une proposition de projet
  approveProposal: async (projectId) => {
    try {
      const response = await api.post(`/admin/projects/${projectId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la validation de la proposition' };
    }
  },

  // Récupérer les statistiques du système (Admin)
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des statistiques' };
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression' };
    }
  },

  // Créer un utilisateur (Admin)
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users/create', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de l\'utilisateur' };
    }
  },

  // Modifier un utilisateur (Admin)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la modification de l\'utilisateur' };
    }
  },

  // Rechercher des utilisateurs avec des filtres
  searchUsers: async (filters) => {
    try {
      const response = await api.get('/admin/users/search', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la recherche d\'utilisateurs' };
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (userId, password) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  },

  // Rechercher des projets
  searchProjects: async (filters) => {
    try {
      const response = await api.get('/admin/projects/search', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la recherche de projets' };
    }
  },

  // Rejeter une proposition
  rejectProposal: async (projectId) => {
    try {
      const response = await api.post(`/admin/projects/${projectId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du rejet du projet' };
    }
  },

  // Clôturer un projet
  closeProject: async (projectId) => {
    try {
      const response = await api.post(`/admin/projects/${projectId}/close`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la clôture du projet' };
    }
  },

  // Récupérer tous les livrables
  getDeliverables: async () => {
    try {
      const response = await api.get('/admin/deliverables');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des livrables' };
    }
  },

  // Gestion des périodes académiques
  getPeriods: async () => {
    try {
      const response = await api.get('/admin/periods');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des périodes' };
    }
  },

  createPeriod: async (data) => {
    try {
      const response = await api.post('/admin/periods', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la période' };
    }
  },

  togglePeriod: async (periodId, active) => {
    try {
      const response = await api.put(`/admin/periods/${periodId}/toggle`, { active });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la période' };
    }
  },

  deletePeriod: async (periodId) => {
    try {
      const response = await api.delete(`/admin/periods/${periodId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression de la période' };
    }
  },

  // Gestion des catégories
  getCategories: async () => {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des catégories' };
    }
  },

  createCategory: async (data) => {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la catégorie' };
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await api.delete(`/admin/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression de la catégorie' };
    }
  },

  // Journaux d'activité
  getAuditLogs: async (limit = 50) => {
    try {
      const response = await api.get('/admin/audit-logs', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des logs' };
    }
  },

  // Gestion des soutenances
  getSoutenances: async () => {
    try {
      const response = await api.get('/soutenances');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des soutenances' };
    }
  },

  scheduleSoutenance: async (data) => {
    try {
      const response = await api.post('/admin/soutenances', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la planification' };
    }
  },

  updateSoutenance: async (id, data) => {
    try {
      const response = await api.put(`/admin/soutenances/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour' };
    }
  },

  deleteSoutenance: async (id) => {
    try {
      const response = await api.delete(`/admin/soutenances/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression' };
    }
  },

  // Détails approfondis d'un projet
  getProjectDetails: async (projectId) => {
    try {
      const response = await api.get(`/admin/projects/${projectId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des détails du projet' };
    }
  },

  // Suivi global des évaluations
  getAllEvaluations: async () => {
    try {
      const response = await api.get('/admin/evaluations/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des évaluations' };
    }
  },

  // Opérations de maintenance
  backupDatabase: async () => {
    try {
      const response = await api.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la sauvegarde' };
    }
  },

  generateGlobalReport: async () => {
    try {
      const response = await api.post('/admin/system/report');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la génération du rapport' };
    }
  },
};

export default adminService;
