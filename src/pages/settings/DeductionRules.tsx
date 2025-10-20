import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { deductionsApi } from '../../api/deductions';
import { passbookApi } from '../../api/passbook';
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Modal } from '../../components/common';
import { Plus, Edit2, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { DeductionRule, CreateDeductionRuleRequest } from '../../types';

export default function DeductionRules() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DeductionRule | null>(null);
  const [formData, setFormData] = useState<CreateDeductionRuleRequest>({
    sacco: currentSacco?.id || 0,
    section: 0,
    applies_to: 'recipient',
    is_active: true,
    effective_from: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['deduction-rules', currentSacco?.id],
    queryFn: () => deductionsApi.getDeductionRules(currentSacco!.id),
    enabled: !!currentSacco,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateDeductionRuleRequest) => deductionsApi.createDeductionRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-rules', currentSacco?.id] });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Deduction rule created successfully!');
    },
    onError: () => {
      toast.error('Failed to create deduction rule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DeductionRule> }) =>
      deductionsApi.updateDeductionRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-rules', currentSacco?.id] });
      setIsEditModalOpen(false);
      setSelectedRule(null);
      resetForm();
      toast.success('Deduction rule updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update deduction rule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deductionsApi.deleteDeductionRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-rules', currentSacco?.id] });
      toast.success('Deduction rule deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete deduction rule');
    },
  });

  const resetForm = () => {
    setFormData({
      sacco: currentSacco?.id || 0,
      section: 0,
      applies_to: 'recipient',
      is_active: true,
      effective_from: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreate = () => {
    if (!formData.section) {
      toast.error('Please select a section');
      return;
    }
    // Amount will be set automatically from section on backend
    createMutation.mutate(formData);
  };

  const handleEdit = (rule: DeductionRule) => {
    setSelectedRule(rule);
    setFormData({
      sacco: rule.sacco,
      section: rule.section,
      applies_to: rule.applies_to,
      is_active: rule.is_active,
      effective_from: rule.effective_from,
      effective_until: rule.effective_until,
      description: rule.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedRule) return;
    // Amount will be updated automatically from section on backend
    updateMutation.mutate({
      id: selectedRule.id,
      data: formData,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this deduction rule?')) {
      deleteMutation.mutate(id);
    }
  };

  const compulsorySections = sections.filter((s) => s.is_compulsory);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deduction Rules</h1>
              <p className="text-gray-600 mt-1">
                Configure automatic deductions for cash round recipients
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          Add Deduction Rule
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">How Deduction Rules Work</h3>
              <p className="text-sm text-gray-600 mt-1">
                Deduction rules define automatic deductions from the cash round recipient's payout.
                These deductions are credited to their passbook sections and added to the amount
                banked by the SACCO.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deduction Rules ({rules.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading deduction rules...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No deduction rules configured yet</p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const section = sections.find((s) => s.id === rule.section);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: section?.color || '#6366f1' }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {rule.section_name || section?.name || 'Unknown Section'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            UGX {parseFloat(rule.amount).toLocaleString()} •{' '}
                            {rule.applies_to === 'recipient'
                              ? 'Cash Round Recipient'
                              : rule.applies_to === 'all_members'
                              ? 'All Members'
                              : 'Specific Members'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Effective from: {new Date(rule.effective_from).toLocaleDateString()}
                            {rule.effective_until &&
                              ` until ${new Date(rule.effective_until).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rule.is_effective_now ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Deduction Rule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passbook Section *
            </label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value={0}>Select section...</option>
              {compulsorySections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.section_type})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only compulsory sections can have deductions. The deduction amount will be automatically set from the section's weekly amount.
            </p>
            {formData.section > 0 && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Deduction Amount:</strong> UGX{' '}
                  {parseFloat(
                    compulsorySections.find((s) => s.id === formData.section)?.weekly_amount || '0'
                  ).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applies To
            </label>
            <select
              value={formData.applies_to}
              onChange={(e) =>
                setFormData({ ...formData, applies_to: e.target.value as 'recipient' | 'all_members' | 'specific' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="recipient">Cash Round Recipient Only</option>
              <option value="all_members">All Members</option>
            </select>
          </div>

          <Input
            label="Effective From *"
            type="date"
            value={formData.effective_from}
            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
            required
          />

          <Input
            label="Effective Until (Optional)"
            type="date"
            value={formData.effective_until || ''}
            onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes about this deduction..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={createMutation.isPending}
            >
              Create Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Deduction Rule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passbook Section *
            </label>
            <select
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {compulsorySections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.section_type})
                </option>
              ))}
            </select>
            {formData.section > 0 && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Deduction Amount:</strong> UGX{' '}
                  {parseFloat(
                    compulsorySections.find((s) => s.id === formData.section)?.weekly_amount || '0'
                  ).toLocaleString()}
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Amount will be updated automatically from the section's weekly amount
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applies To
            </label>
            <select
              value={formData.applies_to}
              onChange={(e) =>
                setFormData({ ...formData, applies_to: e.target.value as 'recipient' | 'all_members' | 'specific' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="recipient">Cash Round Recipient Only</option>
              <option value="all_members">All Members</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <Input
            label="Effective From *"
            type="date"
            value={formData.effective_from}
            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
            required
          />

          <Input
            label="Effective Until (Optional)"
            type="date"
            value={formData.effective_until || ''}
            onChange={(e) => setFormData({ ...formData, effective_until: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={updateMutation.isPending}
            >
              Update Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
