import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 
 * @param {boolean} isOpen - État d'ouverture de la modale
 * @param {function} onClose - Fonction pour fermer la modale
 * @param {string} title - Titre de la modale
 * @param {React.ReactNode} children - Contenu de la modale
 * @param {string} maxWidth - Largeur maximale de la modale (ex: 'max-w-md', 'max-w-lg', etc.)
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md', padding = 'p-6' }) {
  
  // Fermer avec la touche Echap
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Bloquer le scroll du body quand la modale est ouverte
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-[2rem] shadow-2xl w-full ${maxWidth} transform transition-all flex flex-col max-h-[90vh] overflow-hidden`}>
        
        {/* Header (conditionally rendered) */}
        {title && (
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-black text-[#0B1C3F]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Close Button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors z-30 bg-white/50 backdrop-blur-md"
          >
            <X size={20} />
          </button>
        )}

        {/* Body (scrollable) */}
        <div className={`${padding} overflow-y-auto flex-1`}>
          {children}
        </div>
        
      </div>
    </div>
  );
}
