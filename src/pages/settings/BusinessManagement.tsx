import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { businessApi } from '../../api/business';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
} from '../../components/common';
import {
  ArrowLeft,
  Store,
  Plus,
  Settings as SettingsIcon,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type {
  SaccoEnterprise,
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
  UpdateConfigurationRequest,
  BusinessType,
} from '../../types';
import { BUSINESS_TYPE_LABELS } from '../../types';

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'retail', label: 'Retail Shop' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'restaurant', label: 'Restaurant/Café' },
  { value: 'farm', label: 'Agriculture' },
  { value: 'transport', label: 'Transport Service' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

export default function BusinessManagement() {
  const { currentSacco } = useSacco();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SaccoEnterprise | null>(null);

  const [formData, setFormData] = useState<CreateEnterpriseRequest>({
    name: '',
    business_type: 'retail',
    description: '',
    phone: '',
    email: '',
    location: '',
    sacco: currentSacco?.id || 0,
  });

  const [configData, setConfigData] = useState<UpdateConfigurationRequest>({
    stock_management_enabled: false,
    sales_management_enabled: false,
    auto_create_finance_entries: true,
    sales_affect_stock: true,
    default_currency: 'UGX',
    tax_rate: '0',
  });

  // Queries
  const { data: businesses = [], isLoading, error } = useQuery({
    queryKey: ['businesses', currentSacco?.id],
    queryFn: () => businessApi.getEnterprises(currentSacco!.id),
    enabled: !!currentSacco,
  });

  // Ensure businesses is always an array
  const businessList = Array.isArray(businesses) ? businesses : [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateEnterpriseRequest) => businessApi.createEnterprise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', currentSacco?.id] });
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Business created successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to create business');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnterpriseRequest }) =>
      businessApi.updateEnterprise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', currentSacco?.id] });
      setIsEditModalOpen(false);
      setSelectedBusiness(null);
      resetForm();
      toast.success('Business updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update business');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => businessApi.deleteEnterprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', currentSacco?.id] });
      toast.success('Business deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete business');
    },
  });

  const configMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConfigurationRequest }) =>
      businessApi.updateConfiguration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', currentSacco?.id] });
      setIsConfigModalOpen(false);
      setSelectedBusiness(null);
      toast.success('Configuration updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update configuration');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      business_type: 'retail',
      description: '',
      phone: '',
      email: '',
      location: '',
      sacco: currentSacco?.id || 0,
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }
    createMutation.mutate({ ...formData, sacco: currentSacco!.id });
  };

  const handleEdit = (business: SaccoEnterprise) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      business_type: business.business_type,
      description: business.description,
      phone: business.phone,
      email: business.email,
      location: business.location,
      sacco: business.sacco,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedBusiness) return;
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }
    updateMutation.mutate({ id: selectedBusiness.id, data: formData });
  };

  const handleDelete = (business: SaccoEnterprise) => {
    if (window.confirm(`Are you sure you want to delete "${business.name}"?`)) {
      deleteMutation.mutate(business.id);
    }
  };

  const handleConfigure = (business: SaccoEnterprise) => {
    setSelectedBusiness(business);
    setConfigData({
      stock_management_enabled: business.configuration.stock_management_enabled,
      sales_management_enabled: business.configuration.sales_management_enabled,
      auto_create_finance_entries: business.configuration.auto_create_finance_entries,
      sales_affect_stock: business.configuration.sales_affect_stock,
      default_currency: business.configuration.default_currency,
      tax_rate: business.configuration.tax_rate,
    });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = () => {
    if (!selectedBusiness) return;
    configMutation.mutate({ id: selectedBusiness.id, data: configData });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading businesses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading businesses</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
              <p className="text-gray-600 mt-1">
                Manage SACCO businesses, modules, and settings
              </p>
            </div>
          </div>
        </div>
        {businessList.length === 0 && (
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>
            Add Business
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Store className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Group Business Enterprises</h3>
              <p className="text-sm text-gray-600 mt-1">
                Create and manage businesses owned by your Group. Each business can have its own
                inventory, sales tracking, and financial accounts.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Businesses Grid */}
      {businessList.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Store className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Businesses Yet</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Start by creating your first business venture. You can add shops, farms,
                restaurants, or any other business type.
              </p>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>
                Create First Business
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessList.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Store className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {BUSINESS_TYPE_LABELS[business.business_type]}
                      </p>
                    </div>
                  </div>
                  {business.is_active ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {business.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
                  )}

                  {/* Contact Info */}
                  {(business.phone || business.location) && (
                    <div className="space-y-1">
                      {business.phone && (
                        <p className="text-xs text-gray-500">📞 {business.phone}</p>
                      )}
                      {business.location && (
                        <p className="text-xs text-gray-500">📍 {business.location}</p>
                      )}
                    </div>
                  )}

                  {/* Modules Enabled */}
                  <div className="flex flex-wrap gap-2">
                    {business.configuration.stock_management_enabled && (
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                        📦 Stock
                      </span>
                    )}
                    {business.configuration.sales_management_enabled && (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                        💰 Sales
                      </span>
                    )}
                    {business.configuration.auto_create_finance_entries && (
                      <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full">
                        📊 Finance
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigure(business)}
                      leftIcon={<SettingsIcon size={14} />}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(business)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(business)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create Business Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Business"
      >
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Kiwanga Cooperative Shop"
            leftIcon={<Store size={18} />}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <select
              value={formData.business_type}
              onChange={(e) =>
                setFormData({ ...formData, business_type: e.target.value as BusinessType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the business"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+256700123456"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="business@example.com"
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Main Street, Kiwanga"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={createMutation.isPending}
            >
              Create Business
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Business Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Business"
      >
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={<Store size={18} />}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              value={formData.business_type}
              onChange={(e) =>
                setFormData({ ...formData, business_type: e.target.value as BusinessType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              isLoading={updateMutation.isPending}
            >
              Update Business
            </Button>
          </div>
        </div>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title={`Configure ${selectedBusiness?.name}`}
      >
        <div className="space-y-6 max-h-[70vh] md:max-h-none overflow-y-auto pr-2">
          {/* Module Toggles */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Feature Modules</h3>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Stock Management</p>
                <p className="text-sm text-gray-600">Enable inventory/stock tracking</p>
              </div>
              <button
                onClick={() =>
                  setConfigData({
                    ...configData,
                    stock_management_enabled: !configData.stock_management_enabled,
                  })
                }
                className="focus:outline-none"
              >
                {configData.stock_management_enabled ? (
                  <ToggleRight className="text-green-600" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-400" size={32} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sales Management</p>
                <p className="text-sm text-gray-600">Enable sales/POS features</p>
              </div>
              <button
                onClick={() =>
                  setConfigData({
                    ...configData,
                    sales_management_enabled: !configData.sales_management_enabled,
                  })
                }
                className="focus:outline-none"
              >
                {configData.sales_management_enabled ? (
                  <ToggleRight className="text-green-600" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-400" size={32} />
                )}
              </button>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Integration Settings</h3>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto Finance Entries</p>
                <p className="text-sm text-gray-600">
                  Automatically create finance transactions
                </p>
              </div>
              <button
                onClick={() =>
                  setConfigData({
                    ...configData,
                    auto_create_finance_entries: !configData.auto_create_finance_entries,
                  })
                }
                className="focus:outline-none"
              >
                {configData.auto_create_finance_entries ? (
                  <ToggleRight className="text-green-600" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-400" size={32} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sales Affect Stock</p>
                <p className="text-sm text-gray-600">Sales automatically reduce stock</p>
              </div>
              <button
                onClick={() =>
                  setConfigData({
                    ...configData,
                    sales_affect_stock: !configData.sales_affect_stock,
                  })
                }
                className="focus:outline-none"
                disabled={!configData.stock_management_enabled || !configData.sales_management_enabled}
              >
                {configData.sales_affect_stock ? (
                  <ToggleRight className="text-green-600" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-400" size={32} />
                )}
              </button>
            </div>
          </div>

          {/* Business Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Business Settings</h3>

            <Input
              label="Default Currency"
              value={configData.default_currency}
              onChange={(e) =>
                setConfigData({ ...configData, default_currency: e.target.value })
              }
              placeholder="UGX"
            />

            <Input
              label="Tax Rate (%)"
              type="number"
              value={configData.tax_rate}
              onChange={(e) => setConfigData({ ...configData, tax_rate: e.target.value })}
              placeholder="0"
              leftIcon={<DollarSign size={18} />}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveConfig}
              isLoading={configMutation.isPending}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
