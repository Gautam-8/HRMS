import { z } from "zod";

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Transportation",
  "Agriculture",
  "Entertainment",
  "Energy",
  "Real Estate",
  "Hospitality",
  "Consulting",
  "Other"
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];

// Organization form schema
export const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  description: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  legalName: z.string().min(2, "Legal name must be at least 2 characters"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format").optional().or(z.literal("")),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST number format").optional().or(z.literal("")),
});

// HR form schema
export const hrSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
});

// Combined schema for API request
export const createOrganizationSchema = organizationSchema.merge(hrSchema);

// Infer types from schemas
export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type HRFormData = z.infer<typeof hrSchema>;
export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>; 