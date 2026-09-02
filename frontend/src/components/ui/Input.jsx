import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  className = '',
  id,
  autoComplete,
  spellCheck,
  inputMode,
  step,
  min,
  max,
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  const isCodeOrEmail = type === 'email' || type === 'password' || name?.toLowerCase().includes('sku') || name?.toLowerCase().includes('gst');
  const defaultSpellCheck = spellCheck !== undefined ? spellCheck : isCodeOrEmail ? false : undefined;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold text-slate-700 uppercase font-mono tracking-wider select-none cursor-pointer"
        >
          {label} {required && <span className="text-[#ea580c]" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        spellCheck={defaultSpellCheck}
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        className={`w-full px-3.5 py-2.5 text-base sm:text-xs rounded-lg border bg-white text-[#121316] placeholder-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:border-[#ea580c] disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-500 focus-visible:ring-rose-500 text-rose-900'
            : 'border-[#dcdcd5] hover:border-[#121316]'
        } ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-[11px] font-medium text-rose-600 flex items-center gap-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};