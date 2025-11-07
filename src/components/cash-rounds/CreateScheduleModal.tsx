import { useState } from 'react';
import Modal from '../common/Modal';
import type { CashRoundMember } from '../../api/cashRound';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: CashRoundMember[];
  onSubmit: (rotationOrder: number[]) => void;
  isLoading?: boolean;
}

export default function CreateScheduleModal({
  isOpen,
  onClose,
  members,
  onSubmit,
  isLoading,
}: CreateScheduleModalProps) {
  const [rotationOrder, setRotationOrder] = useState<number[]>(
    members.map(m => m.member).sort((a, b) => {
      const memberA = members.find(m => m.member === a);
      const memberB = members.find(m => m.member === b);
      return (memberA?.position_in_rotation || 0) - (memberB?.position_in_rotation || 0);
    })
  );

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...rotationOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setRotationOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === rotationOrder.length - 1) return;
    const newOrder = [...rotationOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setRotationOrder(newOrder);
  };

  const handleSubmit = () => {
    onSubmit(rotationOrder);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Rotation Schedule"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Set the order in which members will receive payouts. Use the arrows to reorder members.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Member Rotation Order ({rotationOrder.length} members)
          </label>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
            {rotationOrder.map((memberId, index) => {
              const member = members.find(m => m.member === memberId);
              return (
                <div
                  key={memberId}
                  className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg"
                >
                  <span className="text-sm font-semibold text-gray-500 w-10">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {member?.member_name}
                    </p>
                    <p className="text-xs text-gray-500">#{member?.member_number}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === rotationOrder.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 The rotation determines the order members receive payouts each week. Once created, you can start the cash round.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
