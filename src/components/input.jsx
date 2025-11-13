// src/components/Input.jsx
import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false,
  error,
  placeholder = '',
  className = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={props.id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors ${error ? 'focus:ring-red-500 focus:border-red-500' : ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;