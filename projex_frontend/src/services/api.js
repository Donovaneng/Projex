import axios from 'axios';

/**
 * Instance configurée d'Axios pour communiquer avec le backend PHP.
 * Inclut la gestion des identifiants (cookies/sessions) via `withCredentials`.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: "http://localhost/projex/projex_backend/public/api",
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Intercepteur de réponse global.
 * Gère automatiquement les erreurs d'authentification (401 Non Autorisé).
 * Redirige l'utilisateur vers la page de connexion, sauf si la requête
 * était pour vérifier la session au démarrage (`/me`) ou s'il est déjà sur `/login`.
 */
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