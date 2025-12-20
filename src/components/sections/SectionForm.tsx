import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { PassbookSection, CreateSectionRequest, SectionType } from '../../types';
import { Input, Button, Card, CardBody, CardFooter } from '../common';
import { isRequired, getErrorMessage } from '../../utils/validation';
import { DEFAULT_SECTION_COLORS, SECTION_TYPE_LABELS } from '../../utils/constants';

interface SectionFormProps {
  section?: PassbookSection;
  onSubmit: (data: CreateSectionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SectionForm({ section, onSubmit, onCancel, isLoading }: SectionFormProps) {
  const isEdit = !!section;

  const [formData, setFormData] = useState<CreateSectionRequest>({
    sacco: section?.sacco || 0,
    name: section?.name || '',
    section_type: section?.section_type || 'savings',
    description: section?.description || '',
    is_compulsory: section?.is_compulsory ?? false,
    weekly_amount: section?.weekly_amount || '0',
    allow_variable_amounts: section?.allow_variable_amounts ?? true,
    withdrawable: section?.withdrawable ?? false,
    display_order: section?.display_order || 0,
    color: section?.color || DEFAULT_SECTION_COLORS.savings,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isRequired(formData.name)) {
      newErrors.name = getErrorMessage('Section name', 'required');
    }

    if (formData.is_compulsory && !isRequired(formData.weekly_amount)) {
      newErrors.weekly_amount = getErrorMessage('Weekly amount', 'required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (field: keyof CreateSectionRequest, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Update color when section type changes
    if (field === 'section_type') {
      const sectionType = value as SectionType;
      setFormData((prev) => ({
        ...prev,
        color: DEFAULT_SECTION_COLORS[sectionType] || DEFAULT_SECTION_COLORS.other,
      }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardBody>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Section Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  required
                  placeholder="e.g., Compulsory Savings"
                  leftIcon={<BookOpen size={18} />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.section_type}
                    onChange={(e) => handleChange('section_type', e.target.value as SectionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of this section..."
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                {/* Compulsory */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_compulsory"
                    checked={formData.is_compulsory}
                    onChange={(e) => handleChange('is_compulsory', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_compulsory" className="text-sm font-medium text-gray-700">
                    Compulsory contribution (members must pay this weekly)
                  </label>
                </div>

                {/* Variable Amounts */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allow_variable_amounts"
                    checked={formData.allow_variable_amounts}
                    onChange={(e) => handleChange('allow_variable_amounts', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="allow_variable_amounts" className="text-sm font-medium text-gray-700">
                    Allow variable amounts (members can pay different amounts)
                  </label>
                </div>

                {/* Withdrawable */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="withdrawable"
                    checked={!!formData.withdrawable}
                    onChange={(e) => handleChange('withdrawable', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="withdrawable" className="text-sm font-medium text-gray-700">
                    Withdrawable (members can withdraw balances from this section)
                  </label>
                </div>

                {/* Weekly Amount */}
                {formData.is_compulsory && (
                  <Input
                    label="Weekly Amount (UGX)"
                    type="number"
                    value={formData.weekly_amount}
                    onChange={(e) => handleChange('weekly_amount', e.target.value)}
                    error={errors.weekly_amount}
                    required
                    placeholder="0"
                    helperText="Fixed amount members must contribute weekly"
                  />
                )}

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>

                {/* Display Order */}
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                  placeholder="0"
                  helperText="Order in which this section appears (lower numbers first)"
                />
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEdit ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
