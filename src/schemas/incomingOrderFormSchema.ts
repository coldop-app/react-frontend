import { z } from 'zod';

// Commodity enum validation
export const commodityEnum = z.enum([
  'POTATO',
  'ONION',
  'GARLIC',
  'TOMATO',
  'CARROT',
  'APPLE',
  'SWEETS',
  'OTHER',
]);

// Location validation schema
export const locationSchema = z.object({
  chamber: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  row: z.string().optional().nullable(),
});

// Helper function to validate quantity string (allows floats)
const validateQuantityString = (val: string): boolean => {
  if (!val || val.trim() === '') return false;
  const num = parseFloat(val);
  return !isNaN(num) && isFinite(num) && num > 0;
};

// Variety entry schema (matches the form structure)
export const varietyEntrySchema = z.object({
  variety: z.string().min(1, 'Variety name is required'),
  quantities: z
    .record(z.string(), z.string())
    .refine(
      (quantities) => {
        // At least one quantity must be provided and valid (allows floats)
        return Object.values(quantities).some((qty) => validateQuantityString(qty));
      },
      {
        message: 'At least one valid quantity must be provided for this variety',
      }
    )
    .refine(
      (quantities) => {
        // All non-empty quantities must be valid numbers (allows floats)
        return Object.values(quantities).every((qty) => {
          if (!qty || qty.trim() === '') return true; // Empty is allowed
          return validateQuantityString(qty);
        });
      },
      {
        message: 'All quantities must be valid positive numbers (decimals allowed)',
      }
    ),
  customMarka: z
    .record(z.string(), z.string())
    .optional()
    .refine(
      (customMarka) => {
        if (!customMarka) return true;
        // If customMarka exists, validate max length for each value
        return Object.values(customMarka).every((marka) => !marka || marka.length <= 50);
      },
      {
        message: 'Custom marka must be at most 50 characters',
      }
    ),
  locations: z
    .record(
      z.string(),
      z.object({
        chamber: z.string().optional().nullable(),
        floor: z.string().optional().nullable(),
        row: z.string().optional().nullable(),
      })
    )
    .optional(),
});

// Main incoming order form schema for regular vouchers
export const incomingOrderFormSchema = z.object({
  farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
  commodity: commodityEnum,
  remarks: z.string().max(500, 'Remarks must be at most 500 characters').optional().nullable(),
  storeCharge: z.coerce.number().min(0, 'Store charge must be non-negative').optional(),
  varieties: z
    .array(varietyEntrySchema)
    .min(1, 'At least one variety must be added')
    .refine(
      (varieties) => {
        // Each variety must have at least one valid quantity
        return varieties.every((variety) => {
          return Object.values(variety.quantities).some((qty) => validateQuantityString(qty));
        });
      },
      {
        message: 'Each variety must have at least one valid quantity',
      }
    ),
});

// Schema for null voucher (varieties array is empty)
export const nullVoucherFormSchema = z.object({
  farmerStorageLinkId: z.string().min(1, 'Please select a farmer'),
  commodity: commodityEnum,
  remarks: z.string().max(500, 'Remarks must be at most 500 characters').optional().nullable(),
  storeCharge: z.coerce.number().min(0, 'Store charge must be non-negative').optional(),
  varieties: z.array(z.any()).length(0, 'Null vouchers must have no varieties'),
});

// Union schema that handles both regular and null vouchers
export const incomingOrderFormSchemaWithNullVoucher = z.discriminatedUnion('isNullVoucher', [
  incomingOrderFormSchema.extend({
    isNullVoucher: z.literal(false),
  }),
  nullVoucherFormSchema.extend({
    isNullVoucher: z.literal(true),
  }),
]);

// Type inference
export type IncomingOrderFormData = z.infer<typeof incomingOrderFormSchema>;
export type VarietyEntryFormData = z.infer<typeof varietyEntrySchema>;
export type NullVoucherFormData = z.infer<typeof nullVoucherFormSchema>;
export type IncomingOrderFormDataWithNullVoucher = z.infer<
  typeof incomingOrderFormSchemaWithNullVoucher
>;
