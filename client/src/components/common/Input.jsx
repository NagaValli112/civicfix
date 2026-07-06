import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, name, required = false, className = '' }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            required={required}
            className={`input-base ${className}`}
            style={{}} // Removed inline styles in favor of CSS class
        />
    );
};

export default Input;
