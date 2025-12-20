import type { ReactNode, HTMLAttributes } from 'react';
import type { Status, MeetingStatus, LoanStatus, WithdrawalStatus } from '../../types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Status-specific badges
interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active' },
    inactive: { variant: 'default' as const, label: 'Inactive' },
    suspended: { variant: 'warning' as const, label: 'Suspended' },
    resigned: { variant: 'error' as const, label: 'Resigned' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

interface WithdrawalStatusBadgeProps {
  status: WithdrawalStatus;
  className?: string;
}

export function WithdrawalStatusBadge({ status, className = '' }: WithdrawalStatusBadgeProps) {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'Pending' },
    approved: { variant: 'info' as const, label: 'Approved' },
    disbursed: { variant: 'success' as const, label: 'Disbursed' },
    rejected: { variant: 'error' as const, label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
  className?: string;
}

export function MeetingStatusBadge({ status, className = '' }: MeetingStatusBadgeProps) {
  const statusConfig = {
    planned: { variant: 'info' as const, label: 'Planned' },
    in_progress: { variant: 'warning' as const, label: 'In Progress' },
    completed: { variant: 'success' as const, label: 'Completed' },
    cancelled: { variant: 'error' as const, label: 'Cancelled' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export function LoanStatusBadge({ status, className = '' }: LoanStatusBadgeProps) {
  const statusConfig = {
    pending: { variant: 'warning' as const, label: 'Pending' },
    approved: { variant: 'info' as const, label: 'Approved' },
    disbursed: { variant: 'info' as const, label: 'Disbursed' },
    active: { variant: 'success' as const, label: 'Active' },
    paid: { variant: 'default' as const, label: 'Paid' },
    defaulted: { variant: 'error' as const, label: 'Defaulted' },
    rejected: { variant: 'error' as const, label: 'Rejected' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
