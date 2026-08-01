export interface DepotPosition {
  id?: number;
  booking_id: number;
  depot_account_id: number;
  security_id: number;
  quantity: number;
  price_per_unit: number;
  purchase_date: string;
}

export interface DepotPositionSummary {
  security_id: number;
  security_name: string;
  security_type: string;
  isin: string;
  total_quantity: number;
  average_price_per_unit: number;
  total_purchase_value: number;
  first_purchase_date: string;
}

export interface DepotPurchaseHistoryItem {
  booking_id: number;
  booking_date: string;
  security_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}
