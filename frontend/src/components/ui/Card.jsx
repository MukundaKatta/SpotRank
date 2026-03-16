const variantStyles = {
  default:
    'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-card',
  glass: 'glass',
  gradient:
    'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-card',
};

export default function Card({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl p-6 animate-fadeIn
        ${variantStyles[variant]}
        ${hoverable ? 'hover:shadow-card-hover hover:scale-[1.02] cursor-pointer transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
