"use client";

import { useEffect } from 'react';

// Form field validation rules
export const VALIDATION_RULES = {
  required: {
    test: value => value !== undefined && value !== null && value !== '',
    message: 'This field is required'
  },
  email: {
    test: value => !value || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
    message: 'Please enter a valid email address'
  },
  minLength: (min) => ({
    test: value => !value || value.length >= min,
    message: `Must be at least ${min} characters`
  }),
  maxLength: (max) => ({
    test: value => !value || value.length <= max,
    message: `Must be no more than ${max} characters`
  }),
  passwordStrength: {
    test: value => !value || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value),
    message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number'
  },
  match: (field, fieldName) => ({
    test: (value, formValues) => !value || value === formValues[field],
    message: `Must match ${fieldName}`
  }),
  url: {
    test: value => !value || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
    message: 'Please enter a valid URL'
  },
  numeric: {
    test: value => !value || /^\d+$/.test(value),
    message: 'Please enter numbers only'
  },
  phoneNumber: {
    test: value => !value || /^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, '')),
    message: 'Please enter a valid phone number'
  }
};

// Custom form hook for validation
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validate a single field
  const validateField = (name, value) => {
    if (!validationRules[name]) return '';
    
    const fieldRules = validationRules[name];
    
    for (const rule of fieldRules) {
      const isValid = rule.test(value, values);
      if (!isValid) {
        return rule.message;
      }
    }
    
    return '';
  };
  
  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (callback) => {
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
    
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await callback(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

// Form input component with validation
export function FormInput({ 
  name, 
  label, 
  type = 'text', 
  errors, 
  touched,
  onChange,
  onBlur,
  value,
  required = false,
  placeholder = '',
  className = '',
  disabled = false,
  ...props 
}) {
  const hasError = touched[name] && errors[name];
  const inputId = `input-${name}`;
  const errorId = `error-${name}`;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        id={inputId}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? errorId : undefined}
        className={`mt-1 block w-full rounded-md border ${
          hasError ? 'border-red-300' : 'border-gray-300'
        } shadow-sm focus:border-[#191970] focus:ring focus:ring-[#191970] focus:ring-opacity-50 ${className}`}
        {...props}
      />
      
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );
}

// Form textarea component with validation
export function FormTextarea({
  name, 
  label, 
  errors, 
  touched,
  onChange,
  onBlur,
  value,
  required = false,
  placeholder = '',
  rows = 3,
  className = '',
  ...props 
}) {
  const hasError = touched[name] && errors[name];
  const textareaId = `textarea-${name}`;
  const errorId = `error-${name}`;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={textareaId} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <textarea
        id={textareaId}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? errorId : undefined}
        className={`mt-1 block w-full rounded-md border ${
          hasError ? 'border-red-300' : 'border-gray-300'
        } shadow-sm focus:border-[#191970] focus:ring focus:ring-[#191970] focus:ring-opacity-50 ${className}`}
        {...props}
      />
      
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );
}

// Form select component with validation
export function FormSelect({
  name, 
  label, 
  options,
  errors, 
  touched,
  onChange,
  onBlur,
  value,
  required = false,
  className = '',
  ...props 
}) {
  const hasError = touched[name] && errors[name];
  const selectId = `select-${name}`;
  const errorId = `error-${name}`;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={selectId} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        id={selectId}
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? errorId : undefined}
        className={`mt-1 block w-full rounded-md border ${
          hasError ? 'border-red-300' : 'border-gray-300'
        } shadow-sm focus:border-[#191970] focus:ring focus:ring-[#191970] focus:ring-opacity-50 ${className}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  );
}
