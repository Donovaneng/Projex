import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  border = false,
  hover = false,
  ...props 
}) {
  const baseClasses = 'bg-white rounded-lg';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const borders = {
    none: '',
    default: 'border border-gray-200',
    left: 'border-l-4 border-blue-600',
    right: 'border-r-4 border-blue-600',
    top: 'border-t-4 border-blue-600',
    bottom: 'border-b-4 border-blue-600'
  };

  const hoverEffects = {
    none: '',
    default: 'hover:shadow-lg transition-shadow duration-200',
    scale: 'hover:scale-105 transition-transform duration-200'
  };

  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${border ? borders[border] || borders.default : ''} ${hover ? hoverEffects[hover] || hoverEffects.default : ''} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

// Card sub-components for better organization
Card.Header = function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

Card.Content = function CardContent({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};