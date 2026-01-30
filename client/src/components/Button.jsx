import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white border-t border-blue-400/30 border-b-2 border-blue-900 shadow-lg hover:shadow-blue-500/20 active:translate-y-[1px] active:shadow-md",
    secondary: "bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-gray-800 active:to-gray-900 text-gray-100 border-t border-gray-500/30 border-b-2 border-gray-900 shadow-lg hover:shadow-gray-500/20 active:translate-y-[1px] active:shadow-md",
    success: "bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-800 text-white border-t border-emerald-400/30 border-b-2 border-emerald-900 shadow-lg hover:shadow-emerald-500/20 active:translate-y-[1px] active:shadow-md",
    danger: "bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-700 active:to-red-800 text-white border-t border-red-400/30 border-b-2 border-red-900 shadow-lg hover:shadow-red-500/20 active:translate-y-[1px] active:shadow-md",
    warning: "bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-white border-t border-amber-300/30 border-b-2 border-amber-800 shadow-lg hover:shadow-amber-500/20 active:translate-y-[1px] active:shadow-md",
    ghost: "bg-gray-800/30 hover:bg-gray-700/50 active:bg-gray-600/60 text-gray-300 border border-gray-700/50 hover:border-gray-600/50 shadow-sm hover:shadow-gray-500/10 active:translate-y-[1px] backdrop-blur-sm",
    outline: "bg-transparent hover:bg-blue-900/20 active:bg-blue-900/30 text-blue-400 border-2 border-blue-500/50 hover:border-blue-400 hover:text-blue-300 shadow-sm hover:shadow-blue-500/10 active:translate-y-[1px]",
  };

  const sizes = {
    small: "px-4 py-2 text-sm gap-2 h-9 rounded-lg",
    medium: "px-5 py-3 text-sm gap-2 h-11 rounded-lg",
    large: "px-6 py-3.5 text-base gap-2 h-12 rounded-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";
  
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.medium;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Ripple effect background */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      
      <div className="flex items-center justify-center gap-2 relative z-10">
        {isLoading ? (
          <>
            <svg 
              className="animate-spin h-4 w-4 text-current" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}
            <span className="truncate font-medium">{children}</span>
            {rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
          </>
        )}
      </div>
    </button>
  );
};

export default Button;