import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { passbookApi } from '../../api';
import { useSacco } from '../../hooks/useSacco';
import type { PassbookSection, CreateSectionRequest, ApiError } from '../../types';
import { Button, Card, CardBody, CardHeader, CardTitle, Modal, Input } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import { formatDate } from '../../utils/format';
import { SECTION_TYPE_LABELS } from '../../utils/constants';

export default function PassbookManagement() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PassbookSection | null>(null);

  // Section form state
  const [sectionForm, setSectionForm] = useState<Partial<CreateSectionRequest>>({
    name: '',
    section_type: 'savings',
    description: '',
    is_compulsory: false,
    weekly_amount: '0',
    allow_variable_amounts: true,
    display_order: 0,
    color: '#6366f1',
  });

  // Fetch passbooks (backend filters by user's SACCO automatically)
  const { data: passbooks = [], isLoading: passbooksLoading, error: passbooksError } = useQuery({
    queryKey: ['passbooks'],
    queryFn: () => passbookApi.getPassbooks(),
  });

  // Fetch sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco,
  });


  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: (data: CreateSectionRequest) => passbookApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['passbooks'] });
      toast.success('Section created successfully');
      setAddSectionOpen(false);
      resetSectionForm();
    },
    onError: (error: { response?: { data?: ApiError } }) => {
      toast.error(error.response?.data?.detail || 'Failed to create section');
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSectionRequest }) =>
      passbookApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['passbooks'] });
      toast.success('Section updated successfully');
      setEditingSection(null);
      setAddSectionOpen(false);
      resetSectionForm();
    },
    onError: (error: { response?: { data?: ApiError } }) => {
      toast.error(error.response?.data?.detail || 'Failed to update section');
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: number) => passbookApi.deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      queryClient.invalidateQueries({ queryKey: ['passbooks'] });
      toast.success('Section deleted successfully');
    },
    onError: (error: { response?: { data?: ApiError } }) => {
      toast.error(error.response?.data?.detail || 'Failed to delete section');
    },
  });

  const resetSectionForm = () => {
    setSectionForm({
      name: '',
      section_type: 'savings',
      description: '',
      is_compulsory: false,
      weekly_amount: '0',
      allow_variable_amounts: true,
      display_order: 0,
      color: '#6366f1',
    });
  };


  const handleSaveSection = () => {
    if (!sectionForm.name || !currentSacco) return;

    const data: CreateSectionRequest = {
      sacco: currentSacco.id,
      name: sectionForm.name,
      section_type: sectionForm.section_type || 'savings',
      description: sectionForm.description,
      is_compulsory: sectionForm.is_compulsory || false,
      weekly_amount: sectionForm.weekly_amount || '0',
      allow_variable_amounts: sectionForm.allow_variable_amounts ?? true,
      display_order: sectionForm.display_order || 0,
      color: sectionForm.color || '#6366f1',
    };

    if (editingSection) {
      updateSectionMutation.mutate({ id: editingSection.id, data });
    } else {
      createSectionMutation.mutate(data);
    }
  };

  const handleEditSection = (section: PassbookSection) => {
    setEditingSection(section);
    setSectionForm({
      name: section.name,
      section_type: section.section_type,
      description: section.description,
      is_compulsory: section.is_compulsory,
      weekly_amount: section.weekly_amount,
      allow_variable_amounts: section.allow_variable_amounts,
      display_order: section.display_order,
      color: section.color,
    });
    setAddSectionOpen(true);
  };

  const handleDeleteSection = (sectionId: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteSectionMutation.mutate(sectionId);
    }
  };

  if (passbooksLoading || sectionsLoading) {
    return <Loading message="Loading passbooks..." />;
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Passbook Management</h1>
        <p className="text-gray-600 mt-1">
          Manage member passbooks and passbook sections
        </p>
      </div>

      {/* Show error if any */}
      {passbooksError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading passbooks</p>
          <p className="text-sm mt-1">{(passbooksError as Error).message}</p>
        </div>
      )}

      {/* Passbooks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Member Passbooks ({passbooks.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {passbooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passbooks.map((passbook) => (
                <Link
                  key={passbook.id}
                  to={`/passbook/${passbook.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white hover:border-indigo-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <BookOpen className="text-indigo-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {passbook.member_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        #{passbook.passbook_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Member: #{passbook.member_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        Issued: {formatDate(passbook.issued_date)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No passbooks yet</h3>
              <p className="text-gray-500 mb-4">
                Passbooks are automatically created when you add SACCO members.
                <br />
                Add members to get started.
              </p>
              <Link to="/members/new">
                <Button variant="primary" leftIcon={<Plus size={18} />}>
                  Add Member
                </Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Passbook Sections ({sections.length})</CardTitle>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => {
                setEditingSection(null);
                resetSectionForm();
                setAddSectionOpen(true);
              }}
            >
              Add Section
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{section.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {SECTION_TYPE_LABELS[section.section_type]}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditSection(section)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                        title="Edit section"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete section"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {section.description && (
                    <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  )}

                  <div className="mt-3 space-y-1">
                    {section.is_compulsory && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Compulsory
                      </span>
                    )}
                    {section.weekly_amount !== '0.00' && parseFloat(section.weekly_amount) > 0 && (
                      <p className="text-xs text-gray-600">
                        Weekly: UGX {parseFloat(section.weekly_amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-4">
                Create sections to organize different types of savings and transactions
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus size={18} />}
                onClick={() => {
                  setEditingSection(null);
                  resetSectionForm();
                  setAddSectionOpen(true);
                }}
              >
                Create First Section
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Section Modal */}
      <Modal
        isOpen={addSectionOpen}
        onClose={() => {
          setAddSectionOpen(false);
          setEditingSection(null);
          resetSectionForm();
        }}
        title={editingSection ? 'Edit Section' : 'Add Section'}
      >
        <div className="space-y-4">
          <Input
            label="Section Name"
            type="text"
            value={sectionForm.name || ''}
            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
            placeholder="e.g., Compulsory Savings"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Type
            </label>
            <select
              value={sectionForm.section_type}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, section_type: e.target.value as CreateSectionRequest['section_type'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="savings">Savings</option>
              <option value="welfare">Welfare</option>
              <option value="development">Development</option>
              <option value="loan">Loan</option>
              <option value="emergency">Emergency</option>
              <option value="interest">Interest</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Description (Optional)"
            type="text"
            value={sectionForm.description || ''}
            onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
            placeholder="Brief description of this section"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weekly Amount (UGX)"
              type="number"
              value={sectionForm.weekly_amount || '0'}
              onChange={(e) => setSectionForm({ ...sectionForm, weekly_amount: e.target.value })}
              min="0"
              step="1000"
            />

            <Input
              label="Display Order"
              type="number"
              value={sectionForm.display_order || 0}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, display_order: parseInt(e.target.value) })
              }
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={sectionForm.color || '#6366f1'}
              onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
              className="h-10 w-full rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sectionForm.is_compulsory || false}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, is_compulsory: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Compulsory</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sectionForm.allow_variable_amounts ?? true}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, allow_variable_amounts: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Allow Variable Amounts</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setAddSectionOpen(false);
                setEditingSection(null);
                resetSectionForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSection}
              isLoading={createSectionMutation.isPending || updateSectionMutation.isPending}
              disabled={!sectionForm.name}
            >
              {editingSection ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
