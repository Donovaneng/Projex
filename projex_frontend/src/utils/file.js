/**
 * Formate un chemin de fichier pour générer une URL valide vers le backend.
 * Gère les anciens chemins absolus erronés et les nouveaux chemins relatifs.
 * 
 * @param {string} path Le chemin du fichier stocké en base de données
 * @param {string} baseUrl L'URL de base du backend (par défaut http://localhost:8000)
 * @returns {string} L'URL complète vers le fichier
 */
export const formatFileUrl = (path, baseUrl) => {
  const finalBaseUrl = baseUrl || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost/projex/projex_backend/public');
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // Nettoyage des anciens préfixes erronés
  let cleanPath = path.replace('/projex/public/', '');
  
  // S'assurer qu'il n'y a pas de double slash au début si on rejoint avec baseUrl
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  return `${baseUrl}/${cleanPath}`;
};
