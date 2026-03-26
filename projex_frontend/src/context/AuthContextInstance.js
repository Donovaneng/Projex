import { createContext } from 'react';

/**
 * Contexte d'authentification exporté séparément pour permettre au AuthProvider
 * d'être le seul export de composant dans son fichier, évitant ainsi les erreurs
 * de Fast Refresh (React Refresh).
 */
export const AuthContext = createContext(null);
