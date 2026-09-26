export type UserRole = 'owner' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export type IndustryCategory =
  | 'healthcare'
  | 'beauty'
  | 'fitness'
  | 'consulting'
  | 'professional_services'
  | 'food_hospitality'
  | 'education'
  | 'home_services'
  | 'real_estate'
  | 'creative_services'
  | 'other';

export type BookingModelType =
  | 'appointment'
  | 'service_booking'
  | 'consultation'
  | 'meeting'
  | 'event_session'
  | 'custom';

export type CustomerPreferencePriority =
  | 'Speed'
  | 'Convenience'
  | 'Premium experience'
  | 'Price'
  | 'Privacy'
  | 'Personalization'
  | 'Trust'
  | 'Flexibility'
  | 'Expertise';

export interface TargetAudience {
  ageRange: string;
  customerType: 'B2B' | 'B2C' | 'Both';
  scope: 'local' | 'national' | 'international';
  priorities: CustomerPreferencePriority[];
  description?: string;
}

export type ServiceStatus = 'active' | 'inactive' | 'draft';

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  status: ServiceStatus;
  order: number;
  category?: string;
  icon?: string;
}

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'multiple_choice'
  | 'address'
  | 'url'
  | 'file_upload'
  | 'service_selector'
  | 'datetime_selector'
  | 'consent_checkbox';

export interface ConditionalRule {
  targetFieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_checked';
  value: string | boolean;
  action: 'show' | 'hide';
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  internalName: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string | boolean | string[];
  options?: string[]; // for dropdown, radio, multi-choice
  order: number;
  stepIndex?: number; // for multi-step form grouping
  visibilityRules?: ConditionalRule[];
  isSystem?: boolean; // e.g. service or date/time
}

export type FormLayoutType = 'single_page' | 'multi_step';
export type FormVisualPreset =
  | 'minimal'
  | 'modern'
  | 'soft'
  | 'professional'
  | 'premium'
  | 'compact';

export type FontFamilyChoice =
  | 'Inter'
  | 'Plus Jakarta Sans'
  | 'DM Sans'
  | 'Poppins'
  | 'Manrope';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  error: string;
  success: string;
}

export interface UIConfiguration {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  inputRadius: 'none' | 'sm' | 'md' | 'lg';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  formWidth: 'narrow' | 'medium' | 'wide';
  spacingDensity: 'compact' | 'comfortable' | 'spacious';
  buttonSize: 'sm' | 'md' | 'lg';
  logoPlacement: 'top_left' | 'top_center' | 'header_left';
  alignment: 'left' | 'center';
}

export interface CTAConfig {
  primaryText: string;
  secondaryText: string;
  submitButtonText: string;
  backButtonText: string;
  confirmationButtonText: string;
}

export interface MessagingConfig {
  headline: string;
  description: string;
  successHeadline: string;
  successInstructions: string;
  cancellationPolicy: string;
  noAvailabilityMessage: string;
  requiredFieldMessage: string;
}

export interface FormConfiguration {
  id: string;
  businessId: string;
  version: number;
  status: 'draft' | 'published' | 'paused' | 'archived';
  layout: FormLayoutType;
  visualPreset: FormVisualPreset;
  branding: {
    logoUrl?: string;
    colors: BrandColors;
    headingFont: FontFamilyChoice;
    bodyFont: FontFamilyChoice;
    ui: UIConfiguration;
  };
  cta: CTAConfig;
  messaging: MessagingConfig;
  fields: FormField[];
  publishedAt?: string;
  updatedAt: string;
}

export interface DaySchedule {
  dayOfWeek: number; // 0: Sunday, 1: Monday, ... 6: Saturday
  isOpen: boolean;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breaks: Array<{ startTime: string; endTime: string }>;
}

export interface BusinessAvailability {
  businessId: string;
  timezone: string;
  workingDays: DaySchedule[];
  minNoticeHours: number;
  maxAdvanceDays: number;
  slotIntervalMinutes: number;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  industryCategory: IndustryCategory;
  specificNiche: string;
  targetAudience: TargetAudience;
  bookingModel: BookingModelType;
  businessEmail: string;
  businessPhone: string;
  websiteUrl?: string;
  socialLink?: string;
  country: string;
  city: string;
  timezone: string;
  logoUrl?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface CustomerAnswer {
  fieldId: string;
  fieldLabel: string;
  value: any;
}

export interface AppointmentSnapshot {
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  serviceCurrency: string;
  formVersion: number;
  timezone: string;
  customerAnswers: CustomerAnswer[];
}

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  serviceId: string;
  serviceSnapshot: {
    name: string;
    duration: number;
    price: number;
    currency: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  answers: Record<string, any>; // fieldId -> value
  answersSnapshot: CustomerAnswer[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  fullName: string;
  email: string;
  phone: string;
  totalBookings: number;
  firstBookingDate: string;
  lastBookingDate: string;
  customData?: Record<string, any>;
  notes?: string;
}

export type FunnelEventType =
  | 'page_view'
  | 'booking_started'
  | 'service_selected'
  | 'slot_selected'
  | 'form_started'
  | 'booking_submitted'
  | 'booking_confirmed';

export interface AnalyticsEvent {
  id: string;
  businessId: string;
  type: FunnelEventType;
  timestamp: string;
  serviceId?: string;
  metadata?: Record<string, any>;
}

export interface BusinessAnalyticsSummary {
  pageViews: number;
  bookingStarts: number;
  serviceSelections: number;
  completions: number;
  cancellations: number;
  noShows: number;
  conversionRate: number;
  topServices: Array<{ serviceName: string; count: number; revenue: number }>;
}
