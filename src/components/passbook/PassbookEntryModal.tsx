import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { passbookApi } from '../../api';
import type { PassbookEntry, PassbookSection } from '../../types';

interface PassbookEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  passbookId: number;
  section: PassbookSection;
  entry?: PassbookEntry | null;
}

export default function PassbookEntryModal({
  isOpen,
  onClose,
  onSuccess,
  passbookId,
  section,
  entry,
}: PassbookEntryModalProps) {
  const [formData, setFormData] = useState({
    transaction_type: 'credit' as 'credit' | 'debit',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        transaction_type: entry.transaction_type,
        amount: entry.amount.toString(),
        description: entry.description || '',
        transaction_date: entry.transaction_date,
      });
    } else {
      setFormData({
        transaction_type: 'credit',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [entry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        passbook: passbookId,
        section: section.id,
        transaction_type: formData.transaction_type,
        amount: formData.amount, // Keep as string for API
        description: formData.description,
        transaction_date: formData.transaction_date,
      };

      if (entry) {
        await passbookApi.updateEntry(entry.id, data);
        toast.success('Entry updated successfully');
      } else {
        await passbookApi.createEntry(data);
        toast.success('Entry created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast.error(entry ? 'Failed to update entry' : 'Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {entry ? 'Edit Entry' : 'New Entry'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {section.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="credit"
                  checked={formData.transaction_type === 'credit'}
                  onChange={(e) => handleChange('transaction_type', e.target.value)}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                <span className="text-sm text-green-600 font-medium">Credit (+)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="debit"
                  checked={formData.transaction_type === 'debit'}
                  onChange={(e) => handleChange('transaction_type', e.target.value)}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                <span className="text-sm text-red-600 font-medium">Debit (-)</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              disabled={isSubmitting}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.transaction_date}
              onChange={(e) => handleChange('transaction_date', e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="Enter transaction description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                entry ? 'Update Entry' : 'Create Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
