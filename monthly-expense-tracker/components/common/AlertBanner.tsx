'use client';

interface AlertBannerProps {
  variant: 'warning' | 'critical' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

const alertStyles = {
  warning: 'alert-warning',
  critical: 'alert-critical',
  success: 'bg-green-50 border-l-4 border-green-400 p-4 text-green-700',
  info: 'bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700',
};

export function AlertBanner({ variant, message, onClose }: AlertBannerProps) {
  return (
    <div className={alertStyles[variant]} role="alert">
      <div className="flex items-center justify-between">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-current hover:opacity-75"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
