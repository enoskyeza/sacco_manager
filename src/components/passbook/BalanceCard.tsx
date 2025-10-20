import { Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import Card, { CardBody } from '../common/Card';

interface BalanceCardProps {
  balance: string;
  sectionName: string;
  sectionColor: string;
  isCompulsory?: boolean;
}

export default function BalanceCard({
  balance,
  sectionName,
  sectionColor,
  isCompulsory,
}: BalanceCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${sectionColor}20` }}
            >
              <Wallet size={24} style={{ color: sectionColor }} />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {sectionName}
                {isCompulsory && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
