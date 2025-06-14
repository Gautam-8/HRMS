import { z } from 'zod';
import { INDUSTRY_OPTIONS } from '../types/organization';

export const organizationFormSchema = z.object({
  // Organization details
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().optional(),
  industry: z.enum(INDUSTRY_OPTIONS as unknown as [string, ...string[]], {
    required_error: 'Please select an industry',
  }),
  legalName: z.string().min(2, 'Legal name must be at least 2 characters'),
  panNumber: z.string().regex(
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    'Invalid PAN number format'
  ).optional().or(z.literal('')),
  gstNumber: z.string().regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GST number format'
  ).optional().or(z.literal('')),

  // HR details
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    ),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
}); 