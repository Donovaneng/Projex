import React from 'react';

export default function Input({ 
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  containerClassName = '',
  ...props 
}) {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  
  const stateClasses = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500';

  const classes = `${baseClasses} ${stateClasses} ${Icon ? 'pl-10' : ''} ${className}`;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}
        
        <input
          className={classes}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// Specialized input components
Input.Textarea = function Textarea({ 
  label,
  error,
  helperText,
  required = false,
  rows = 4,
  className = '',
  containerClassName = '',
  ...props 
}) {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical';
  
  const stateClasses = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500';

  const classes = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        className={classes}
        rows={rows}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

Input.Select = function Select({ 
  label,
  error,
  helperText,
  required = false,
  options = [],
  placeholder = 'Sélectionner...',
  className = '',
  containerClassName = '',
  ...props 
}) {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white';
  
  const stateClasses = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-blue-500';

  const classes = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        className={classes}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};