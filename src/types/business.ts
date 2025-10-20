import type { BaseModel } from './common';

/**
 * Business Module Types
 */

export type BusinessType = 
  | 'retail'
  | 'wholesale'
  | 'restaurant'
  | 'farm'
  | 'transport'
  | 'manufacturing'
  | 'services'
  | 'other';

/**
 * Enterprise Configuration
 */
export interface EnterpriseConfiguration extends BaseModel {
  stock_management_enabled: boolean;
  sales_management_enabled: boolean;
  auto_create_finance_entries: boolean;
  sales_affect_stock: boolean;
  default_currency: string;
  tax_rate: string; // Decimal as string
  settings: Record<string, unknown>;
}

/**
 * SACCO Enterprise (Business)
 */
export interface SaccoEnterprise extends BaseModel {
  name: string;
  business_type: BusinessType;
  description: string;
  phone: string;
  email: string;
  location: string;
  sacco: number;
  sacco_name: string;
  finance_account: number | null;
  finance_account_name: string | null;
  is_active: boolean;
  configuration: EnterpriseConfiguration;
}

/**
 * Create Enterprise Request
 */
export interface CreateEnterpriseRequest {
  name: string;
  business_type: BusinessType;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  sacco: number;
}

/**
 * Update Enterprise Request
 */
export interface UpdateEnterpriseRequest {
  name?: string;
  business_type?: BusinessType;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  is_active?: boolean;
}

/**
 * Update Configuration Request
 */
export interface UpdateConfigurationRequest {
  stock_management_enabled?: boolean;
  sales_management_enabled?: boolean;
  auto_create_finance_entries?: boolean;
  sales_affect_stock?: boolean;
  default_currency?: string;
  tax_rate?: string;
  settings?: Record<string, unknown>;
}

/**
 * Business Finance Accounts
 */
export interface BusinessAccounts {
  cash: {
    id: number;
    name: string;
    balance: string;
  } | null;
  inventory: {
    id: number;
    name: string;
    balance: string;
  } | null;
  revenue: {
    id: number;
    name: string;
    balance: string;
  } | null;
  cogs: {
    id: number;
    name: string;
    balance: string;
  } | null;
  expenses: {
    id: number;
    name: string;
    balance: string;
  } | null;
}

/**
 * Stock Item
 */
export interface StockItem extends BaseModel {
  enterprise: number;
  enterprise_name: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_of_measure: string;
  quantity_on_hand: number;
  reorder_level: number;
  reorder_quantity: number;
  cost_price: string; // Decimal as string
  selling_price: string; // Decimal as string
  barcode: string;
  is_active: boolean;
  is_low_stock: boolean;
  total_value: string;
  potential_revenue: string;
  profit_margin: string;
}

/**
 * Create Stock Item Request
 */
export interface CreateStockItemRequest {
  enterprise: number;
  sku?: string;
  name: string;
  description?: string;
  category: string;
  unit_of_measure?: string;
  quantity_on_hand: number;
  reorder_level?: number;
  reorder_quantity?: number;
  cost_price: string;
  selling_price: string;
  barcode?: string;
}

/**
 * Update Stock Item Request
 */
export interface UpdateStockItemRequest {
  name?: string;
  description?: string;
  category?: string;
  unit_of_measure?: string;
  quantity_on_hand?: number;
  reorder_level?: number;
  reorder_quantity?: number;
  cost_price?: string;
  selling_price?: string;
  barcode?: string;
  is_active?: boolean;
}

/**
 * Sale Item
 */
export interface SaleItem extends BaseModel {
  sale: number;
  stock_item: number;
  stock_item_name: string;
  stock_item_sku: string;
  quantity: number;
  unit_price: string;
  unit_cost: string;
  discount_percentage: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
  total_cost: string;
  profit: string;
}

/**
 * Sale
 */
export interface Sale extends BaseModel {
  enterprise: number;
  enterprise_name: string;
  sale_number: string;
  sale_date: string;
  customer_name: string;
  customer_phone: string;
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  payment_method: 'cash' | 'mobile' | 'bank' | 'credit';
  amount_paid: string;
  status: 'draft' | 'completed' | 'cancelled';
  served_by: number;
  served_by_name: string;
  notes: string;
  items: SaleItem[];
  change_amount: string;
  total_cost: string;
  profit: string;
}

/**
 * Create Sale Request
 */
export interface CreateSaleRequest {
  enterprise: number;
  customer_name?: string;
  customer_phone?: string;
  payment_method?: 'cash' | 'mobile' | 'bank' | 'credit';
  notes?: string;
  items: {
    stock_item_id: number;
    quantity: number;
    unit_price?: string;
    discount?: string;
  }[];
}

/**
 * Business Types Display Labels
 */
export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  retail: 'Retail Shop',
  wholesale: 'Wholesale',
  restaurant: 'Restaurant/Café',
  farm: 'Agriculture',
  transport: 'Transport Service',
  manufacturing: 'Manufacturing',
  services: 'Services',
  other: 'Other',
};
