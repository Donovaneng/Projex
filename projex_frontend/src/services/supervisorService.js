import api from './api';

const supervisorService = {
  // Récupérer le profil de l'encadreur
  getProfile: async () => {
    try {
      const response = await api.get('/supervisor/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération du profil' };
    }
  },

  // Récupérer les projets assignés à l'encadreur
  getProjects: async () => {
    try {
      const response = await api.get('/supervisor/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des projets' };
    }
  },

  // Récupérer les détails d'un projet spécifique
  getProjectDetails: async (projectId) => {
    try {
      const response = await api.get(`/supervisor/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des détails du projet' };
    }
  },

  // Récupérer les étudiants sous la supervision de l'encadreur
  getStudents: async () => {
    try {
      const response = await api.get('/supervisor/students');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des étudiants' };
    }
  },

  // Récupérer les livrables à évaluer
  getDeliverablesToReview: async () => {
    try {
      const response = await api.get('/supervisor/deliverables/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des livrables' };
    }
  },

  // Approuver un livrable
  approveDeliverable: async (deliverableId, feedback = '') => {
    try {
      const response = await api.post(`/supervisor/deliverables/${deliverableId}/approve`, {
        feedback
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'approbation du livrable' };
    }
  },

  // Rejeter un livrable
  rejectDeliverable: async (deliverableId, reason) => {
    try {
      const response = await api.post(`/supervisor/deliverables/${deliverableId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du rejet du livrable' };
    }
  },

  // Créer une évaluation académique
  createAcademicEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/supervisor/evaluations/academic', evaluationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de l\'évaluation' };
    }
  },

  // Créer une évaluation professionnelle (pour encadreur pro)
  createProfessionalEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/supervisor/evaluations/professional', evaluationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de l\'évaluation professionnelle' };
    }
  },

  // Récupérer les évaluations effectuées
  getEvaluations: async () => {
    try {
      const response = await api.get('/supervisor/evaluations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des évaluations' };
    }
  },

  // Mettre à jour une évaluation
  updateEvaluation: async (evaluationId, evaluationData) => {
    try {
      const response = await api.put(`/supervisor/evaluations/${evaluationId}`, evaluationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de l\'évaluation' };
    }
  },

  // Créer des tâches pour les étudiants
  createTask: async (taskData) => {
    try {
      const response = await api.post('/supervisor/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la tâche' };
    }
  },

  // Récupérer les notifications de l'encadreur
  getNotifications: async () => {
    try {
      const response = await api.get('/supervisor/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des notifications' };
    }
  },

  // Envoyer un message à un étudiant
  sendMessage: async (studentId, message) => {
    try {
      const response = await api.post('/supervisor/messages', {
        student_id: studentId,
        message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'envoi du message' };
    }
  },

  // Récupérer les propositions de projet
  getProposals: async () => {
    try {
      const response = await api.get('/supervisor/proposals');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des propositions' };
    }
  },

  // Valider ou rejeter une proposition
  handleProposal: async (proposalId, action, comment = '') => {
    try {
      const response = await api.post(`/supervisor/proposals/${proposalId}/handle`, {
        action,
        comment
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du traitement de la proposition' };
    }
  },

  // Récupérer la timeline d'un projet
  getProjectTimeline: async (projectId) => {
    try {
      const response = await api.get(`/supervisor/projects/${projectId}/timeline`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération de la timeline' };
    }
  },

  // Récupérer les compétences pour l'évaluation pro
  getCompetences: async () => {
    try {
      const response = await api.get('/supervisor/competences');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des compétences' };
    }
  },
};

export default supervisorService;