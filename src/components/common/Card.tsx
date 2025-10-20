import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
        hover ? 'hover:shadow-md transition-shadow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({ children, as: Component = 'h3', className = '', ...props }: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </Component>
  );
}
