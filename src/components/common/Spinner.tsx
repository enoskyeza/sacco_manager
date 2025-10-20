import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <Loader2 
      size={sizeMap[size]} 
      className={`animate-spin text-indigo-600 ${className}`} 
    />
  );
}

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 z-50'
    : 'w-full py-12';

  return (
    <div className={`flex flex-col items-center justify-center ${containerClass}`}>
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}
