import axios from 'axios';

// Instance configuree pour pointer vers le backend PHP

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});


// Intercepteur pour gérer les erreurs d'authentification globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si l'API renvoie 401 Non Autorisé
    if (error.response && error.response.status === 401) {
      // Ne pas rediriger si c'est un appel à /me (vérification de session au démarrage)
      // ou si on est déjà sur /login
      if (window.location.pathname !== '/login' && !error.config?.url?.includes('/me')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;