import { useEffect, useState } from 'react';
import { Check, X, Edit2, RotateCcw } from 'lucide-react';
import type { Member, WeeklyContribution } from '../../types';
import { formatCurrency, getInitials } from '../../utils/format';
import { Input, Button } from '../common';

interface ContributionRowProps {
  member: Member;
  expectedAmount: string;
  contribution?: WeeklyContribution;
  onRecord: (amount: string) => Promise<void>;
  onUndo: () => Promise<void>;
  isPending?: boolean;
  disabled?: boolean;
  isRecipient?: boolean;
}

export default function ContributionRow({
  member,
  expectedAmount,
  contribution,
  onRecord,
  onUndo,
  isPending,
  disabled,
  isRecipient = false,
}: ContributionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(contribution?.amount_contributed || expectedAmount);
  const isPaid = !!contribution;

  useEffect(() => {
    setAmount(contribution?.amount_contributed || expectedAmount);
    setIsEditing(false);
  }, [contribution, expectedAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    await onRecord(amount);
    setIsEditing(false);
  };

  const handleQuickPay = async () => {
    await onRecord(expectedAmount);
  };

  const handleUndo = async () => {
    await onUndo();
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
        isPaid
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      } ${
        isRecipient ? 'border-l-4 border-l-yellow-500' : ''
      }`}
    >
      {/* Member Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
          style={{ backgroundColor: isPaid ? '#059669' : '#4338CA' }}
        >
          {isPaid ? <Check size={20} /> : getInitials(member.first_name, member.last_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {member.first_name} {member.last_name}
          </p>
          <p className="text-sm text-gray-500">#{member.member_number}</p>
        </div>
      </div>

      {/* Amount Input/Display */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28"
            placeholder="Amount"
            disabled={isPending || disabled}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isPending}
            disabled={!amount || parseFloat(amount) <= 0 || disabled}
          >
            <Check size={16} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              setAmount(contribution?.amount_contributed || expectedAmount);
            }}
            disabled={isPending || disabled}
          >
            <X size={16} />
          </Button>
        </form>
      ) : isPaid ? (
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold text-green-600">
              {formatCurrency(contribution!.amount_contributed)}
            </p>
            <p className="text-xs text-gray-500">Paid</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={isPending || disabled}
            leftIcon={<RotateCcw size={16} />}
          >
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isPending || disabled}
          >
            <Edit2 size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <p className="font-semibold text-gray-900">
              {formatCurrency(expectedAmount)}
            </p>
            <p className="text-xs text-gray-500">Expected</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickPay}
            isLoading={isPending}
            disabled={disabled}
          >
            Mark Paid
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isPending || disabled}
          >
            <Edit2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
