import { z } from 'zod';

export const HexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
  message: 'Must be a valid hex color code (e.g. #2563eb or #fff)',
});

export const SlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(40, 'Slug cannot exceed 40 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug can only contain lowercase letters, numbers, and single hyphens',
  })
  .refine(
    (slug) => !['admin', 'api', 'book', 'login', 'signup', 'dashboard', 'settings', 'auth'].includes(slug),
    { message: 'This slug is reserved by the system' }
  );

export const ServiceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().min(5, 'Please provide a short description'),
  durationMinutes: z.number().int().min(5, 'Duration must be at least 5 minutes').max(720),
  price: z.number().min(0, 'Price must be 0 or positive'),
  currency: z.string().min(1, 'Currency is required'),
  bufferBeforeMinutes: z.number().int().min(0).default(0),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  status: z.enum(['active', 'inactive', 'draft']),
});

export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().min(1, 'Field label is required'),
  internalName: z.string().min(1, 'Internal identifier is required'),
  required: z.boolean(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
  order: z.number(),
  stepIndex: z.number().optional(),
});

export const BrandColorsSchema = z.object({
  primary: HexColorSchema,
  secondary: HexColorSchema,
  accent: HexColorSchema,
  background: HexColorSchema,
  surface: HexColorSchema,
  text: HexColorSchema,
  mutedText: HexColorSchema,
  error: HexColorSchema,
  success: HexColorSchema,
});

export const FormConfigurationSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  layout: z.enum(['single_page', 'multi_step']),
  visualPreset: z.enum(['minimal', 'modern', 'soft', 'professional', 'premium', 'compact']),
  branding: z.object({
    logoUrl: z.string().optional(),
    colors: BrandColorsSchema,
    headingFont: z.enum(['Inter', 'Plus Jakarta Sans', 'DM Sans', 'Poppins', 'Manrope']),
    bodyFont: z.enum(['Inter', 'Plus Jakarta Sans', 'DM Sans', 'Poppins', 'Manrope']),
    ui: z.object({
      borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
      buttonRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
      inputRadius: z.enum(['none', 'sm', 'md', 'lg']),
      shadow: z.enum(['none', 'sm', 'md', 'lg']),
      formWidth: z.enum(['narrow', 'medium', 'wide']),
      spacingDensity: z.enum(['compact', 'comfortable', 'spacious']),
      buttonSize: z.enum(['sm', 'md', 'lg']),
      logoPlacement: z.enum(['top_left', 'top_center', 'header_left']),
      alignment: z.enum(['left', 'center']),
    }),
  }),
  cta: z.object({
    primaryText: z.string().min(1, 'Primary CTA text is required'),
    secondaryText: z.string(),
    submitButtonText: z.string().min(1, 'Submit button text is required'),
    backButtonText: z.string(),
    confirmationButtonText: z.string(),
  }),
  messaging: z.object({
    headline: z.string().min(1, 'Headline is required'),
    description: z.string(),
    successHeadline: z.string().min(1, 'Success message is required'),
    successInstructions: z.string(),
    cancellationPolicy: z.string(),
    noAvailabilityMessage: z.string(),
    requiredFieldMessage: z.string(),
  }),
  fields: z.array(FormFieldSchema).min(1, 'At least one field is required'),
});

export const BookingSubmissionSchema = z.object({
  businessId: z.string(),
  serviceId: z.string().min(1, 'Please select a service'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Valid start time required (HH:mm)'),
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Valid email address is required'),
  customerPhone: z.string().min(7, 'Valid phone number is required'),
  answers: z.record(z.string(), z.any()),
});
