import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  icon: Icon,
  loadingText,
  ariaLabel,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all';

  const variants = {
    primary: 'bg-[#121316] hover:bg-[#272930] text-white border border-[#121316] shadow-sm',
    orange: 'btn-vyora-orange',
    emerald: 'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 shadow-sm',
    secondary: 'bg-white hover:bg-[#f4f4f0] text-slate-800 border border-[#dcdcd5] shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-sm',
    outline: 'bg-transparent hover:bg-[#f4f4f0] text-slate-700 border border-[#dcdcd5]',
    ghost: 'hover:bg-slate-100 text-slate-700 shadow-none border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-xs font-bold gap-2 min-h-[38px]',
    lg: 'px-5 py-2.5 text-sm font-bold gap-2.5 min-h-[44px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};