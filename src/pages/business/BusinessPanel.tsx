import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSacco } from '../../hooks/useSacco';
import { businessApi } from '../../api/business';
import { Card, CardBody, CardHeader, Button, Modal, Input, TextArea } from '../../components/common';
import { Store, TrendingUp, TrendingDown, Package, Plus, ShoppingCart, Receipt, X, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { toast } from 'sonner';
import type { CreateStockItemRequest, UpdateStockItemRequest, StockItem, CreateSaleRequest, Sale, SaleItem } from '../../types';

type TabType = 'sales' | 'expenses' | 'stock';

export default function BusinessPanel() {
  const { currentSacco } = useSacco();
  const [activeTab, setActiveTab] = useState<TabType>('sales');

  // Fetch the single business for this SACCO
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', currentSacco?.id],
    queryFn: () => currentSacco ? businessApi.getEnterprises(currentSacco.id) : Promise.resolve([]),
    enabled: !!currentSacco,
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Fetch statistics for the business
  const business = businesses[0];
  const { data: salesSummary } = useQuery({
    queryKey: ['sales-summary', business?.id, today],
    queryFn: () => businessApi.getDailySalesSummary(business!.id, today),
    enabled: !!business,
  });

  const { data: stockSummary } = useQuery({
    queryKey: ['stock-summary', business?.id],
    queryFn: () => businessApi.getStockSummary(business!.id),
    enabled: !!business,
  });

  const { data: expensesList = [] } = useQuery({
    queryKey: ['expenses', business?.id],
    queryFn: () => businessApi.getExpenses(business!.id),
    enabled: !!business,
  });

  // Calculate total expenses
  const totalExpenses = expensesList.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading business...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8">
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Store className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Found</h3>
              <p className="text-gray-600 mb-4">
                Create a business in Settings to get started.
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/settings/businesses'}>
                Go to Settings
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const config = business.configuration;

  // Determine available tabs based on configuration
  const allTabs = [
    {
      id: 'sales' as const,
      label: 'Sales',
      icon: ShoppingCart,
      enabled: config.sales_management_enabled,
    },
    {
      id: 'expenses' as const,
      label: 'Expenses',
      icon: Receipt,
      enabled: true, // Always show expenses
    },
    {
      id: 'stock' as const,
      label: 'Stock',
      icon: Package,
      enabled: config.stock_management_enabled,
    },
  ];
  
  const availableTabs = allTabs.filter(tab => tab.enabled);

  // Set first available tab as default if current tab is not enabled
  if (availableTabs.length > 0 && !availableTabs.find(t => t.id === activeTab)) {
    setActiveTab(availableTabs[0].id);
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Store className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-600 capitalize">{business.business_type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(parseFloat(salesSummary?.total_revenue || '0'))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {salesSummary?.total_sales || 0} transactions
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expensesList.length} {expensesList.length === 1 ? 'expense' : 'expenses'}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(parseFloat(stockSummary?.total_value || '0'))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stockSummary?.total_items || 0} items
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Tab Content */}
          {activeTab === 'sales' && <SalesTab businessId={business.id} />}
          {activeTab === 'expenses' && <ExpensesTab businessId={business.id} />}
          {activeTab === 'stock' && <StockTab businessId={business.id} />}
        </CardBody>
      </Card>
    </div>
  );
}

// Sales Tab Component
function SalesTab({ businessId }: { businessId: number }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [saleItems, setSaleItems] = useState<Array<{
    stock_item_id: number;
    stock_item_name: string;
    quantity: number;
    unit_price: string;
  }>>([
    { stock_item_id: 0, stock_item_name: '', quantity: 1, unit_price: '0' }
  ]);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    payment_method: 'cash' as 'cash' | 'mobile' | 'bank' | 'credit',
    notes: '',
  });

  // Fetch sales
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales', businessId],
    queryFn: () => businessApi.getSales(businessId),
  });

  // Fetch stock items for dropdown
  const { data: stockItems = [] } = useQuery({
    queryKey: ['stock-items', businessId],
    queryFn: () => businessApi.getStockItems(businessId),
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: (data: CreateSaleRequest) => businessApi.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', businessId] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Sale recorded successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to record sale');
    },
  });

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      payment_method: 'cash',
      notes: '',
    });
    setSaleItems([
      { stock_item_id: 0, stock_item_name: '', quantity: 1, unit_price: '0' }
    ]);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, {
      stock_item_id: 0,
      stock_item_name: '',
      quantity: 1,
      unit_price: '0',
    }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: string, value: string | number) => {
    const updated = [...saleItems];
    if (field === 'stock_item_id') {
      const selectedItem = stockItems.find((item: StockItem) => item.id === parseInt(value as string));
      if (selectedItem) {
        updated[index].stock_item_id = selectedItem.id;
        updated[index].stock_item_name = selectedItem.name;
        updated[index].unit_price = selectedItem.selling_price;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = value as number;
    } else if (field === 'unit_price') {
      updated[index].unit_price = value as string;
    }
    setSaleItems(updated);
  };

  const getAvailableStockItems = (currentIndex: number) => {
    const selectedIds = saleItems
      .map((item, idx) => idx !== currentIndex ? item.stock_item_id : null)
      .filter(id => id && id !== 0);
    return stockItems.filter((item: StockItem) => !selectedIds.includes(item.id));
  };

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => {
      return sum + (item.quantity * parseFloat(item.unit_price || '0'));
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saleItems.length === 0) {
      toast.error('Please add at least one item to the sale');
      return;
    }

    if (saleItems.some(item => !item.stock_item_id || item.quantity <= 0)) {
      toast.error('Please complete all sale items');
      return;
    }

    const saleData: CreateSaleRequest = {
      enterprise: businessId,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      payment_method: formData.payment_method,
      notes: formData.notes,
      items: saleItems.map(item => ({
        stock_item_id: item.stock_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    createSaleMutation.mutate(saleData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Record Sale
        </Button>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingSales ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading sales...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No sales recorded yet. Click "Record Sale" to get started.
                </td>
              </tr>
            ) : (
              sales.map((sale: Sale) => (
                <tr 
                  key={sale.id} 
                  onClick={() => handleSaleClick(sale)}
                  className="hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                    S{String(sale.id).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sale.items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(parseFloat(sale.total_amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Customer Info */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name (Optional)"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="Walk-in customer"
            />
            <Input
              label="Customer Phone (Optional)"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              placeholder="e.g., 0700123456"
            />
          </div> */}

          {/* Sale Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Sale Items <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={addSaleItem}
              >
                Add Item
              </Button>
            </div>

            {saleItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <select
                    value={item.stock_item_id}
                    onChange={(e) => updateSaleItem(index, 'stock_item_id', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select item...</option>
                    {getAvailableStockItems(index).map((stock: StockItem) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name} (Qty: {stock.quantity_on_hand})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Qty"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateSaleItem(index, 'unit_price', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Price"
                    required
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(item.quantity * parseFloat(item.unit_price || '0'))}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSaleItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}

            {saleItems.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No items added. Click "Add Item" to start.
              </div>
            )}
          </div>

          {/* Total */}
          {saleItems.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="mobile">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          {/* Notes */}
          <TextArea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Additional notes about this sale"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createSaleMutation.isPending}
              disabled={saleItems.length === 0}
            >
              Complete Sale
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sale Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Sale Details - S${selectedSale ? String(selectedSale.id).padStart(3, '0') : ''}`}
      >
        {selectedSale && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Sale Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">Sale Number</p>
                <p className="font-medium">{selectedSale.sale_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(selectedSale.sale_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedSale.customer_name || 'Walk-in'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{selectedSale.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  selectedSale.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedSale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSale.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Served By</p>
                <p className="font-medium">{selectedSale.served_by_name}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedSale.items?.map((item: SaleItem) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.stock_item_name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(parseFloat(item.unit_price))}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.quantity * parseFloat(item.unit_price))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(parseFloat(selectedSale.subtotal))}</span>
              </div>
              {parseFloat(selectedSale.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(parseFloat(selectedSale.discount_amount))}</span>
                </div>
              )}
              {parseFloat(selectedSale.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(parseFloat(selectedSale.tax_amount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(parseFloat(selectedSale.total_amount))}</span>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm mt-1">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// Expenses Tab Component
function ExpensesTab({ businessId }: { businessId: number }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as 'cash' | 'mobile' | 'bank',
    notes: '',
  });

  // Fetch expenses
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses', businessId],
    queryFn: () => businessApi.getExpenses(businessId),
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: (data: {
      enterprise: number;
      amount: string;
      description: string;
      category?: string;
      date?: string;
    }) => businessApi.recordExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', businessId] });
      queryClient.invalidateQueries({ queryKey: ['sales-summary', businessId] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Expense recorded successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to record expense');
    },
  });

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    createExpenseMutation.mutate({
      enterprise: businessId,
      amount: formData.amount,
      description: formData.description,
      category: formData.category.toLowerCase(),
      date: formData.date,
    });
  };

  const expenseCategories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Supplies',
    'Marketing',
    'Transportation',
    'Maintenance',
    'Insurance',
    'Other',
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Business Expenses</h3>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Add Expense
        </Button>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingExpenses ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading expenses...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No expenses recorded yet. Click "Add Expense" to get started.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{expense.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.description}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(parseFloat(expense.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select category...</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Monthly rent payment"
            required
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="mobile">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <TextArea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Additional notes"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              isLoading={createExpenseMutation.isPending}
            >
              Record Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Stock Tab Component
function StockTab({ businessId }: { businessId: number }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState<CreateStockItemRequest>({
    enterprise: businessId,
    name: '',
    category: '',
    unit_of_measure: 'pieces',
    quantity_on_hand: 0,
    cost_price: '',
    selling_price: '0',
    pack_size: undefined,
    pack_cost_price: '',
    pack_selling_price: '',
  });
  
  const [isPack, setIsPack] = useState(false);

  // Fetch stock items
  const { data: stockItems = [], isLoading } = useQuery({
    queryKey: ['stock-items', businessId],
    queryFn: () => businessApi.getStockItems(businessId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStockItemRequest) => businessApi.createStockItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items', businessId] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary', businessId] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Stock item added successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to add stock item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateStockItemRequest }) =>
      businessApi.updateStockItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items', businessId] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary', businessId] });
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
      toast.success('Stock item updated successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to update stock item');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => businessApi.deleteStockItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-items', businessId] });
      queryClient.invalidateQueries({ queryKey: ['stock-summary', businessId] });
      toast.success('Stock item deleted successfully!');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to delete stock item');
    },
  });

  const resetForm = () => {
    setFormData({
      enterprise: businessId,
      name: '',
      category: '',
      unit_of_measure: 'pieces',
      quantity_on_hand: 0,
      cost_price: '',
      selling_price: '0',
      pack_size: undefined,
      pack_cost_price: '',
      pack_selling_price: '',
    });
    setIsPack(false);
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      enterprise: businessId,
      name: item.name,
      category: item.category,
      unit_of_measure: item.unit_of_measure,
      quantity_on_hand: item.quantity_on_hand,
      reorder_level: item.reorder_level,
      cost_price: item.cost_price || '',
      selling_price: item.selling_price,
      pack_size: item.pack_size || undefined,
      pack_cost_price: item.pack_cost_price || '',
      pack_selling_price: item.pack_selling_price || '',
    });
    setIsPack(item.is_pack_item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: StockItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      updateMutation.mutate({
        itemId: editingItem.id,
        data: formData,
      });
    } else {
      // Create new item
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Add Stock Item
        </Button>
      </div>

      {/* Stock Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selling Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Value
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 capitalize">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading inventory...
                </td>
              </tr>
            ) : stockItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No stock items yet. Click "Add Stock Item" to get started.
                </td>
              </tr>
            ) : (
              stockItems.map((item: StockItem) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                        {item.is_pack_item && (
                          <div className="text-xs text-indigo-600 mt-0.5">
                            📦 Pack of {item.pack_size}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.quantity_on_hand <= item.reorder_level
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity_on_hand}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {item.is_pack_item ? (
                      <div>
                        <div className="font-medium">{formatCurrency(parseFloat(item.unit_cost_from_pack))}</div>
                        <div className="text-xs text-gray-500">
                          ({formatCurrency(parseFloat(item.pack_cost_price || '0'))}/pack)
                        </div>
                      </div>
                    ) : (
                      formatCurrency(parseFloat(item.cost_price))
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(parseFloat(item.selling_price))}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(parseFloat(item.total_value))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Stock Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? 'Edit Stock Item' : 'Add Stock Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Coca Cola 500ml"
            />

            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              placeholder="e.g., Beverages"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="liters">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="meters">Meters</option>
                <option value="boxes">Boxes</option>
                <option value="packs">Packs</option>
              </select>
            </div>

            <Input
              label="Quantity on Hand"
              type="number"
              value={formData.quantity_on_hand}
              onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
              required
              placeholder="0"
            />

            <Input
              label="Reorder Level (Optional)"
              type="number"
              value={formData.reorder_level || ''}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || undefined })}
              placeholder="Min quantity before reorder"
            />
          </div>

          {/* Pricing Type Toggle */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isPack"
                checked={isPack}
                onChange={(e) => {
                  setIsPack(e.target.checked);
                  if (!e.target.checked) {
                    // Clear pack fields when unchecked
                    setFormData({
                      ...formData,
                      pack_size: undefined,
                      pack_cost_price: '',
                      pack_selling_price: '',
                    });
                  } else {
                    // Clear unit cost price when using pack pricing
                    setFormData({ ...formData, cost_price: '' });
                  }
                }}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPack" className="text-sm font-medium text-gray-700">
                Item bought in bulk/cartons (e.g., sodas in crates)
              </label>
            </div>
          </div>

          {!isPack ? (
            /* Unit Pricing - For items bought individually */
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 -mb-2">Unit Pricing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Cost Price (per unit)"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  required
                  placeholder="0.00"
                />

                <Input
                  label="Selling Price (per unit)"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
          ) : (
            /* Pack/Bulk Pricing - For items bought in cartons */
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Pack/Carton Pricing</h4>
                <p className="text-xs text-gray-500 mt-1">
                  For items bought in bulk (e.g., crate of 12 sodas at 10,000 UGX, sold at 1,000 UGX each)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Items per Pack/Carton"
                  type="number"
                  value={formData.pack_size || ''}
                  onChange={(e) => setFormData({ ...formData, pack_size: parseInt(e.target.value) || undefined })}
                  required
                  placeholder="e.g., 12"
                />

                <Input
                  label="Pack/Carton Cost Price"
                  type="number"
                  step="0.01"
                  value={formData.pack_cost_price}
                  onChange={(e) => setFormData({ ...formData, pack_cost_price: e.target.value })}
                  required
                  placeholder="e.g., 10000"
                />

                <Input
                  label="Unit Selling Price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  required
                  placeholder="e.g., 1000"
                />

                <Input
                  label="Pack Selling Price (Optional)"
                  type="number"
                  step="0.01"
                  value={formData.pack_selling_price}
                  onChange={(e) => setFormData({ ...formData, pack_selling_price: e.target.value })}
                  placeholder="Leave blank if selling by unit"
                />
              </div>

              {/* Calculated preview */}
              {formData.pack_size && formData.pack_cost_price && formData.selling_price && parseFloat(formData.selling_price) > 0 && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs font-medium text-indigo-900 mb-2">Preview:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Unit Cost:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(parseFloat(formData.pack_cost_price) / formData.pack_size)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pack Revenue:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {formatCurrency(parseFloat(formData.selling_price) * formData.pack_size)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pack Profit:</span>{' '}
                      <span className="font-medium text-green-700">
                        {formatCurrency(
                          (parseFloat(formData.selling_price) * formData.pack_size) - parseFloat(formData.pack_cost_price)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit Margin:</span>{' '}
                      <span className="font-medium text-green-700">
                        {(
                          ((parseFloat(formData.selling_price) * formData.pack_size - parseFloat(formData.pack_cost_price)) /
                            (parseFloat(formData.selling_price) * formData.pack_size)) *
                          100
                        ).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
