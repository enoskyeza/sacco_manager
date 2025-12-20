import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passbookApi } from '../../api';
import { useSacco } from '../../hooks/useSacco';
import type { PassbookSection, CreateSectionRequest } from '../../types';
import { Button, Card, CardBody, Modal, ConfirmModal } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import SectionForm from '../../components/sections/SectionForm';
import { formatCurrency } from '../../utils/format';
import { SECTION_TYPE_LABELS } from '../../utils/constants';

export default function SectionsManagement() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PassbookSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<PassbookSection | null>(null);

  // Fetch sections
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSectionRequest) => passbookApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      setIsFormOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSectionRequest }) =>
      passbookApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      setEditingSection(null);
      setIsFormOpen(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => passbookApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', currentSacco?.id] });
      setDeletingSection(null);
    },
  });

  const handleCreate = () => {
    setEditingSection(null);
    setIsFormOpen(true);
  };

  const handleEdit = (section: PassbookSection) => {
    setEditingSection(section);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreateSectionRequest) => {
    if (editingSection) {
      await updateMutation.mutateAsync({ id: editingSection.id, data });
    } else {
      await createMutation.mutateAsync({ ...data, sacco: currentSacco!.id });
    }
  };

  const handleDelete = async () => {
    if (deletingSection) {
      await deleteMutation.mutateAsync(deletingSection.id);
    }
  };

  if (isLoading) {
    return <Loading message="Loading sections..." />;
  }

  // Sort sections by display order
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passbook Sections</h1>
          <p className="text-gray-600 mt-1">
            Manage the different sections in member passbooks
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={handleCreate}>
          Add Section
        </Button>
      </div>

      {/* Sections List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSections.map((section) => (
          <Card key={section.id} hover>
            <CardBody>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: section.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {SECTION_TYPE_LABELS[section.section_type]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(section)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingSection(section)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {section.description && (
                  <p className="text-sm text-gray-600">{section.description}</p>
                )}

                {/* Settings */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  {section.is_compulsory && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Weekly Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(section.weekly_amount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {section.is_compulsory && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Compulsory
                      </span>
                    )}
                    {section.allow_variable_amounts && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Variable Amounts
                      </span>
                    )}
                    {section.withdrawable && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        Withdrawable
                      </span>
                    )}
                    {!section.is_active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first passbook section to start tracking contributions
              </p>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={handleCreate}>
                Create First Section
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSection(null);
        }}
        title={editingSection ? 'Edit Section' : 'Create New Section'}
        size="lg"
      >
        <SectionForm
          section={editingSection || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingSection(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingSection}
        onClose={() => setDeletingSection(null)}
        onConfirm={handleDelete}
        title="Delete Section"
        message={`Are you sure you want to delete "${deletingSection?.name}"? This action cannot be undone and will affect all member passbooks.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
