import { z } from 'zod';

export const tripSchema = z.object({
  challan_no: z.string().min(1, 'Challan No is required'),
  truck_no: z.string().min(1, 'Truck No is required'),
  driver_name: z.string().min(1, 'Driver Name is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  trip_date: z.string().min(1, 'Trip Date is required'),
});

export const biltiRowSchema = z.object({
  bilti_no: z.string().min(1, 'Bilti No is required'),
  customer_name: z.string().min(1, 'Customer Name is required'),
  receiver_name: z.string().min(1, 'Receiver Name is required'),
  goods_type: z.string().min(1, 'Goods Type is required'),
  items_count: z.coerce.number().int().min(1, 'Items count must be at least 1'),
  weight_numeric: z.coerce.number().positive('Weight must be greater than 0'),
  weight_auto_calculated: z.boolean().default(false),
});

export const manifestSchema = z.object({
  trip: tripSchema,
  biltis: z.array(biltiRowSchema).min(1, 'At least one Bilti entry is required'),
});

export type TripSchemaType = z.infer<typeof tripSchema>;
export type BiltiRowSchemaType = z.infer<typeof biltiRowSchema>;
export type ManifestSchemaType = z.infer<typeof manifestSchema>;
