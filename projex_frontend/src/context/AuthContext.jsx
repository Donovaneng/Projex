import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContextInstance';

/**
 * Fournisseur du contexte d'authentification.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children Les composants enfants qui auront accès au contexte.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si un utilisateur est déjà connecté au chargement
  useEffect(() => {

    let isMounted = true;

    /**
     * Appelle l'API pour récupérer les informations de l'utilisateur
     * actuellement authentifié (via les cookies/sessions).
     */
    const checkAuth = async () => {

      try {
        const response = await api.get('/me');

        if (isMounted) {
          if (response.data.authenticated) {
            setUser(response.data.user);
          } else {
            setUser(null);
          }
        }

      } catch {

        if (isMounted) {
          setUser(null);
        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }

    };

    checkAuth();

    return () => {
      isMounted = false;
    };

  }, []);

  /**
   * Connecte l'utilisateur.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{success: boolean, user?: Object, error?: string}>} Résultat de la tentative.
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de la connexion' 
      };
    }
  };

  /**
   * Gère l'authentification via Google
   */
  const googleLogin = async (data) => {
    try {
      // Si data est une chaîne, c'est l'ancien format (id_token) -> { credential: data }
      // Si data est un objet, c'est le nouveau format (access_token) -> on l'envoie tel quel
      const payload = typeof data === 'string' ? { credential: data } : data;
      const response = await api.post('/auth/google', payload);
      if (response.data.flow === 'LOGIN') {
        setUser(response.data.user);
        return { success: true, flow: 'LOGIN', user: response.data.user };
      } else {
        return { success: true, flow: 'REGISTER', googleData: response.data.googleData };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'authentification Google' 
      };
    }
  };

  /**
   * Inscrit un nouvel utilisateur (et le met en attente de validation
   * par un administrateur selon son rôle).
   * @param {Object} userData Les données du formulaire d'inscription.
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur lors de l\'inscription' 
      };
    }
  };

  /**
   * Déconnecte l'utilisateur et détruit sa session côté serveur.
   */
  const logout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  const value = {
    user,
    setUser,
    login,
    googleLogin,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

