import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin`}>
            <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
        {message && (
          <p className="text-gray-600 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;