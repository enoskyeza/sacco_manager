import apiClient from './client';
import type {
  SaccoEnterprise,
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
  UpdateConfigurationRequest,
  BusinessAccounts,
  StockItem,
  CreateStockItemRequest,
  UpdateStockItemRequest,
  Sale,
  CreateSaleRequest,
} from '../types';

export const businessApi = {
  /**
   * Get all enterprises for a SACCO
   */
  getEnterprises: async (saccoId: number): Promise<SaccoEnterprise[]> => {
    const response = await apiClient.get(`/businesses/enterprises/`, {
      params: { sacco: saccoId },
    });
    // Handle paginated response - extract results array
    return response.data.results || response.data;
  },

  /**
   * Get single enterprise
   */
  getEnterprise: async (enterpriseId: number): Promise<SaccoEnterprise> => {
    const response = await apiClient.get(`/businesses/enterprises/${enterpriseId}/`);
    return response.data;
  },

  /**
   * Create new enterprise
   */
  createEnterprise: async (data: CreateEnterpriseRequest): Promise<SaccoEnterprise> => {
    const response = await apiClient.post('/businesses/enterprises/', data);
    return response.data;
  },

  /**
   * Update enterprise
   */
  updateEnterprise: async (
    enterpriseId: number,
    data: UpdateEnterpriseRequest
  ): Promise<SaccoEnterprise> => {
    const response = await apiClient.patch(`/businesses/enterprises/${enterpriseId}/`, data);
    return response.data;
  },

  /**
   * Delete enterprise
   */
  deleteEnterprise: async (enterpriseId: number): Promise<void> => {
    await apiClient.delete(`/businesses/enterprises/${enterpriseId}/`);
  },

  /**
   * Update enterprise configuration
   */
  updateConfiguration: async (
    enterpriseId: number,
    data: UpdateConfigurationRequest
  ): Promise<SaccoEnterprise> => {
    const response = await apiClient.patch(
      `/businesses/enterprises/${enterpriseId}/configuration/`,
      data
    );
    return response.data;
  },

  // Stock Items
  /**
   * Get stock items for an enterprise
   */
  getStockItems: async (enterpriseId: number): Promise<StockItem[]> => {
    const response = await apiClient.get(`/businesses/stock/`, {
      params: { enterprise: enterpriseId },
    });
    return response.data.results || response.data;
  },

  /**
   * Get single stock item
   */
  getStockItem: async (itemId: number): Promise<StockItem> => {
    const response = await apiClient.get(`/businesses/stock/${itemId}/`);
    return response.data;
  },

  /**
   * Create stock item
   */
  createStockItem: async (data: CreateStockItemRequest): Promise<StockItem> => {
    const response = await apiClient.post(`/businesses/stock/`, data);
    return response.data;
  },

  /**
   * Update stock item
   */
  updateStockItem: async (
    itemId: number,
    data: UpdateStockItemRequest
  ): Promise<StockItem> => {
    const response = await apiClient.patch(`/businesses/stock/${itemId}/`, data);
    return response.data;
  },

  /**
   * Delete stock item
   */
  deleteStockItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/businesses/stock/${itemId}/`);
  },

  // Sales
  /**
   * Get sales for an enterprise
   */
  getSales: async (enterpriseId: number): Promise<Sale[]> => {
    const response = await apiClient.get(`/businesses/sales/`, {
      params: { enterprise: enterpriseId },
    });
    return response.data.results || response.data;
  },

  /**
   * Get single sale
   */
  getSale: async (saleId: number): Promise<Sale> => {
    const response = await apiClient.get(`/businesses/sales/${saleId}/`);
    return response.data;
  },

  /**
   * Create sale
   */
  createSale: async (data: CreateSaleRequest): Promise<Sale> => {
    const response = await apiClient.post(`/businesses/sales/`, data);
    return response.data;
  },

  /**
   * Get daily sales summary
   */
  getDailySalesSummary: async (enterpriseId: number, date?: string): Promise<{
    date: string;
    total_sales: number;
    total_revenue: string;
    total_discount: string;
    total_tax: string;
    average_sale: string;
    total_cost: string;
    total_profit: string;
    profit_margin: number;
  }> => {
    const params: Record<string, string> = { enterprise: enterpriseId.toString() };
    if (date) params.date = date;
    
    const response = await apiClient.get(`/businesses/sales/daily_summary/`, { params });
    return response.data;
  },

  /**
   * Get stock summary
   */
  getStockSummary: async (enterpriseId: number): Promise<{
    total_items: number;
    total_value: string;
    low_stock_items: number;
    out_of_stock_items: number;
  }> => {
    const response = await apiClient.get(`/businesses/stock/summary/`, {
      params: { enterprise: enterpriseId.toString() },
    });
    return response.data;
  },

  /**
   * Record a business expense
   */
  recordExpense: async (data: {
    enterprise: number;
    amount: string;
    description: string;
    category?: string;
    date?: string;
  }): Promise<{
    message: string;
    transaction_id: number;
    amount: string;
    description: string;
  }> => {
    const response = await apiClient.post(`/businesses/sales/record_expense/`, data);
    return response.data;
  },

  /**
   * Get expenses for an enterprise
   */
  getExpenses: async (enterpriseId: number): Promise<Array<{
    id: number;
    date: string;
    category: string;
    description: string;
    amount: string;
    payment_method: string;
  }>> => {
    const response = await apiClient.get(`/businesses/sales/get_expenses/`, {
      params: { enterprise: enterpriseId.toString() },
    });
    return response.data;
  },

  /**
   * Get business finance accounts
   */
  getBusinessAccounts: async (enterpriseId: number): Promise<BusinessAccounts> => {
    const response = await apiClient.get(`/businesses/enterprises/${enterpriseId}/accounts/`);
    return response.data;
  },

  /**
   * Archive business
   */
  archiveEnterprise: async (enterpriseId: number): Promise<void> => {
    await apiClient.post(`/businesses/enterprises/${enterpriseId}/archive/`);
  },
};
