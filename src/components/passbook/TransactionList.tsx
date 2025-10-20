import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { PassbookEntry } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { EmptyState } from '../common';

interface TransactionListProps {
  entries: PassbookEntry[];
  sectionColor: string;
}

export default function TransactionList({ entries, sectionColor }: TransactionListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Transactions will appear here once recorded"
      />
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isCredit = entry.transaction_type === 'credit';
        
        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
          >
            {/* Icon */}
            <div
              className={`p-2 rounded-lg ${
                isCredit ? 'bg-green-50' : 'bg-red-50'
              }`}
              style={
                isCredit
                  ? { backgroundColor: `${sectionColor}20` }
                  : undefined
              }
            >
              {isCredit ? (
                <ArrowDownRight
                  className="text-green-600"
                  size={20}
                  style={{ color: sectionColor }}
                />
              ) : (
                <ArrowUpRight className="text-red-600" size={20} />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(entry.transaction_date)}
                    {entry.reference_number && ` • Ref: ${entry.reference_number}`}
                    {entry.week_number && ` • Week ${entry.week_number}`}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold ${
                      isCredit ? 'text-green-600' : 'text-red-600'
                    }`}
                    style={isCredit ? { color: sectionColor } : undefined}
                  >
                    {isCredit ? '+' : '-'}
                    {formatCurrency(entry.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Bal: {formatCurrency(entry.balance_after)}
                  </p>
                </div>
              </div>

              {entry.is_reversal && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Reversal
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
