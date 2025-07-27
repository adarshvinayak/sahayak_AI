import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${className}
  `.trim();

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;