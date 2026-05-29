export interface MasterRecord {
  id: string;
  name: string;
  city?: string;
  created_at?: string;
}

export interface TripChallan {
  id?: string;
  challan_no: string;
  truck_no: string;
  driver_name: string;
  origin: string;
  destination: string;
  trip_date: string;
  total_biltis?: number;
  total_items?: number;
  total_weight?: number;
  created_at?: string;
  clerk_id?: string;
  status?: string;
}

export interface BiltiEntry {
  id?: string;
  challan_id?: string;
  bilti_no: string;
  customer_name: string;
  receiver_name: string;
  goods_type: string;
  items_count: number;
  weight_numeric: number;
  weight_auto_calculated: boolean;
  created_at?: string;
}
