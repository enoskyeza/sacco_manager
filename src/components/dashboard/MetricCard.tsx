import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../common/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'indigo' | 'green' | 'blue' | 'yellow' | 'red';
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'indigo',
}: MetricCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <Card hover>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
            
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="text-green-600" size={16} />
                ) : (
                  <TrendingDown className="text-red-600" size={16} />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
