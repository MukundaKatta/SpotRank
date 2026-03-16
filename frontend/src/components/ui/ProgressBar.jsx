export default function ProgressBar({ value = 0, showLabel = true, className = '' }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right font-medium">
          {clampedValue}%
        </p>
      )}
    </div>
  );
}
