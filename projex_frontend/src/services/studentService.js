import api from './api';

const studentService = {
  // Récupérer les informations de l'étudiant connecté
  getProfile: async () => {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération du profil' };
    }
  },

  // Récupérer les projets assignés à l'étudiant
  getProjects: async () => {
    try {
      const response = await api.get('/student/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des projets' };
    }
  },

  // Créer un nouveau projet (étudiant) - Proposition
  createProject: async (projectData) => {
    try {
      const response = await api.post('/student/projects/propose', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la proposition du projet' };
    }
  },

  // Mettre à jour une proposition de projet (étudiant)
  updateProposal: async (projectId, projectData) => {
    try {
      const response = await api.put(`/student/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la proposition' };
    }
  },

  // Supprimer une proposition de projet (étudiant)
  deleteProposal: async (projectId) => {
    try {
      const response = await api.delete(`/student/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression de la proposition' };
    }
  },

  // Récupérer les tâches de l'étudiant
  getTasks: async () => {
    try {
      const response = await api.get('/student/tasks');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des tâches' };
    }
  },

  // Mettre à jour le statut d'une tâche
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.put(`/student/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la tâche' };
    }
  },

  // Récupérer les livrables de l'étudiant
  getDeliverables: async () => {
    try {
      const response = await api.get('/student/deliverables');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des livrables' };
    }
  },

  // Déposer un livrable
  uploadDeliverable: async (formData) => {
    try {
      const response = await api.post('/student/deliverables/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du dépôt du livrable' };
    }
  },

  // Supprimer un livrable
  deleteDeliverable: async (deliverableId) => {
    try {
      const response = await api.delete(`/student/deliverables/${deliverableId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du livrable' };
    }
  },

  // Récupérer les évaluations de l'étudiant
  getEvaluations: async () => {
    try {
      const response = await api.get('/student/evaluations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des évaluations' };
    }
  },

  // Récupérer les notifications de l'étudiant
  getNotifications: async () => {
    try {
      const response = await api.get('/student/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des notifications' };
    }
  },

  // Récupérer les projets disponibles (non encore assignés à un étudiant)
  getAvailableProjects: async () => {
    try {
      const response = await api.get('/student/available-projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des projets disponibles' };
    }
  },

  // Postuler à un projet disponible (assignation)
  applyToProject: async (projectId) => {
    try {
      const response = await api.get(`/student/projects/${projectId}/apply`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la postulation au projet' };
    }
  },

  // Ajouter un commentaire sur un livrable
  addDeliverableComment: async (deliverableId, comment) => {
    try {
      const response = await api.post(`/student/deliverables/${deliverableId}/comments`, { comment });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'ajout du commentaire' };
    }
  },

  // Récupérer les commentaires d'un livrable
  getDeliverableComments: async (deliverableId) => {
    try {
      const response = await api.get(`/student/deliverables/${deliverableId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des commentaires' };
    }
  },

  // Mettre à jour les informations d'un livrable (titre, description)
  updateDeliverable: async (deliverableId, data) => {
    try {
      const response = await api.put(`/student/deliverables/${deliverableId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour du livrable' };
    }
  },
};

export default studentService;