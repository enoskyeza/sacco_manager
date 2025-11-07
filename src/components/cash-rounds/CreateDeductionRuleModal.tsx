import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '../common/Modal';
import { passbookApi } from '../../api/passbook';
import { useSacco } from '../../hooks/useSacco';

interface CreateDeductionRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { section: number; applies_to: string }) => void;
  isLoading?: boolean;
}

export default function CreateDeductionRuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateDeductionRuleModalProps) {
  const { currentSacco } = useSacco();
  const [selectedSection, setSelectedSection] = useState<number | ''>('');
  const [appliesTo, setAppliesTo] = useState<string>('recipient');

  // Fetch passbook sections
  const { data: sections = [] } = useQuery({
    queryKey: ['passbook-sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco && isOpen,
  });

  // Filter to only compulsory sections
  const compulsorySections = sections.filter(s => s.is_compulsory);

  // Get selected section details
  const selectedSectionData = compulsorySections.find(s => s.id === selectedSection);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSection('');
      setAppliesTo('recipient');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedSection) return;
    onSubmit({
      section: selectedSection as number,
      applies_to: appliesTo,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Deduction Rule"
      size="md"
    >
      <div className="space-y-5">
        <p className="text-sm text-gray-600">
          Create a rule to automatically deduct fees from contributions based on passbook sections.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passbook Section *
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a section...</option>
            {compulsorySections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Only compulsory passbook sections are available
          </p>
        </div>

        {selectedSectionData && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900">Selected Section</p>
                <p className="text-lg font-semibold text-indigo-900 mt-1">
                  {selectedSectionData.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-indigo-900">Amount</p>
                <p className="text-lg font-semibold text-indigo-900 mt-1">
                  UGX {parseFloat(selectedSectionData.weekly_amount).toLocaleString()}
                </p>
              </div>
            </div>
            {selectedSectionData.description && (
              <p className="text-sm text-indigo-700 mt-2">
                {selectedSectionData.description}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applied To *
          </label>
          <select
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="recipient">Cash Round Recipient Only</option>
            <option value="all_members">All Members</option>
            <option value="specific">Specific Members</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose who this deduction applies to
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ The amount will be automatically set from the section's weekly amount. This deduction will be applied during contribution collection.
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
            disabled={isLoading || !selectedSection}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Rule'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
