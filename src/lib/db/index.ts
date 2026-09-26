import {
  UserProfile,
  Business,
  Service,
  FormConfiguration,
  BusinessAvailability,
  Appointment,
  Customer,
  AnalyticsEvent,
  BusinessAnalyticsSummary,
} from '../../types';
import { validateBookingSlotAvailability } from '../availability';
import { FormConfigurationSchema } from '../validation';
const STORAGE_KEY = 'bookify_saas_db_v6';

export interface DatabaseState {
  currentUser: UserProfile | null;
  users: UserProfile[];
  businesses: Business[];
  services: Service[];
  draftForms: Record<string, FormConfiguration>; // businessId -> draft form
  publishedForms: Record<string, FormConfiguration>; // businessId -> published form
  availabilities: Record<string, BusinessAvailability>; // businessId -> availability
  appointments: Appointment[];
  customers: Customer[];
  analyticsEvents: AnalyticsEvent[];
  activeBusinessId: string | null;
}

// Initial realistic seed data matching Bookify UI reference
export function getInitialSeedData(): DatabaseState {
  const adminUser: UserProfile = {
    id: 'usr_admin_1',
    email: 'aqureshi.1020@gmail.com',
    fullName: 'Aayan Qureshi',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: '2026-01-15T09:00:00Z',
  };

  // 0. Arc Company (Primary Featured Business in Reference UI)
  const bizArc: Business = {
    id: 'biz_arc_00',
    ownerId: adminUser.id,
    name: 'Arc Company',
    slug: 'arc-company',
    description: 'Cloud engineering, API architecture, and enterprise technical strategy consultation.',
    industryCategory: 'professional_services',
    specificNiche: 'Software & Cloud Engineering',
    targetAudience: {
      ageRange: '25-55',
      customerType: 'B2B',
      scope: 'international',
      priorities: ['Speed', 'Expertise', 'Convenience', 'Trust'],
      description: 'Founders, Engineering Directors, and CTOs scaling modern APIs.',
    },
    bookingModel: 'consultation',
    businessEmail: 'aqureshi.1020@gmail.com',
    businessPhone: '+1 (555) 789-0123',
    country: 'United States',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  };

  // 1. Vance Dental Clinic
  const bizDental: Business = {
    id: 'biz_dental_01',
    ownerId: adminUser.id,
    name: 'Vance Dental Clinic',
    slug: 'vance-dental',
    description: 'Modern, compassionate dental care specializing in general dentistry, hygiene, and preventative care.',
    industryCategory: 'healthcare',
    specificNiche: 'Family & Cosmetic Dentistry',
    targetAudience: {
      ageRange: 'All Ages',
      customerType: 'B2C',
      scope: 'local',
      priorities: ['Trust', 'Expertise', 'Speed', 'Comfort' as any],
      description: 'Local families and working professionals seeking anxiety-free dental appointments.',
    },
    bookingModel: 'appointment',
    businessEmail: 'appointments@vancedental.com',
    businessPhone: '+1 (555) 234-5678',
    country: 'United States',
    city: 'Seattle',
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  };

  // 2. L'Aura Studio & Spa
  const bizBeauty: Business = {
    id: 'biz_beauty_02',
    ownerId: adminUser.id,
    name: "L'Aura Studio & Spa",
    slug: 'laura-studio',
    description: 'Boutique hair styling, aesthetic facials, and bridal beauty artistry in the heart of the arts district.',
    industryCategory: 'beauty',
    specificNiche: 'Hair & Aesthetic Skin Spa',
    targetAudience: {
      ageRange: '22-45',
      customerType: 'B2C',
      scope: 'local',
      priorities: ['Premium experience', 'Personalization', 'Convenience'],
      description: 'Discerning clients who want bespoke hair color, treatments, and luxurious self-care.',
    },
    bookingModel: 'service_booking',
    businessEmail: 'concierge@laurastudio.com',
    businessPhone: '+1 (555) 345-6789',
    country: 'United States',
    city: 'Portland',
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-02-10T12:00:00Z',
  };

  // 3. Horizon Advisory
  const bizConsulting: Business = {
    id: 'biz_consult_03',
    ownerId: adminUser.id,
    name: 'Horizon Strategic Advisory',
    slug: 'horizon-advisory',
    description: 'Executive advisory and growth consulting for mid-market B2B software and tech founders.',
    industryCategory: 'consulting',
    specificNiche: 'B2B Growth & M&A Strategy',
    targetAudience: {
      ageRange: '30-60',
      customerType: 'B2B',
      scope: 'international',
      priorities: ['Expertise', 'Privacy', 'Speed'],
      description: 'Founders, VP Product, and CEOs scaling from $2M to $20M ARR.',
    },
    bookingModel: 'consultation',
    businessEmail: 'advisory@horizonadvisory.co',
    businessPhone: '+1 (555) 456-7890',
    country: 'United States',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    onboardingCompleted: true,
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-02-15T14:00:00Z',
  };

  const services: Service[] = [
    // Dental services
    {
      id: 'srv_dent_1',
      businessId: bizDental.id,
      name: 'Comprehensive Dental Consultation',
      description: '30-minute exam including oral health assessment, initial x-ray review, and treatment planning.',
      durationMinutes: 30,
      price: 150,
      currency: 'USD',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      status: 'active',
      order: 0,
      category: 'General',
    },
    {
      id: 'srv_dent_2',
      businessId: bizDental.id,
      name: 'Preventative Hygiene & Teeth Cleaning',
      description: 'Full ultrasonic scaling, polish, fluoride treatment, and gum disease evaluation.',
      durationMinutes: 45,
      price: 200,
      currency: 'USD',
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 10,
      status: 'active',
      order: 1,
      category: 'Hygiene',
    },
    {
      id: 'srv_dent_3',
      businessId: bizDental.id,
      name: 'Post-Op Follow-up Exam',
      description: 'Quick check-up following recent procedures, fillings, or restorative adjustments.',
      durationMinutes: 20,
      price: 0,
      currency: 'USD',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 5,
      status: 'active',
      order: 2,
      category: 'General',
    },

    // Beauty services
    {
      id: 'srv_beauty_1',
      businessId: bizBeauty.id,
      name: 'Signature Haircut & Blowout Style',
      description: 'Consultation, scalp massage, tailored cut, and luxury heat styling.',
      durationMinutes: 60,
      price: 95,
      currency: 'USD',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 0,
    },
    {
      id: 'srv_beauty_2',
      businessId: bizBeauty.id,
      name: 'Radiance Hydro-Glow Facial',
      description: 'Deep pore extraction, hyaluronic acid infusion, and lymphatic facial contouring.',
      durationMinutes: 60,
      price: 145,
      currency: 'USD',
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 1,
    },
    {
      id: 'srv_beauty_3',
      businessId: bizBeauty.id,
      name: 'Bespoke Bridal / Event Makeup Session',
      description: 'Full camera-ready bridal makeup trial with long-wear airbrush and lashes included.',
      durationMinutes: 75,
      price: 180,
      currency: 'USD',
      bufferBeforeMinutes: 10,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 2,
    },

    // Consulting services
    {
      id: 'srv_consult_1',
      businessId: bizConsulting.id,
      name: 'Executive Discovery Call',
      description: '30-minute qualification and scope discovery for enterprise leadership challenges.',
      durationMinutes: 30,
      price: 0,
      currency: 'USD',
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 0,
    },
    {
      id: 'srv_consult_2',
      businessId: bizConsulting.id,
      name: 'Deep-Dive Strategy Session',
      description: '60-minute intensive advisory on GTM bottlenecks, pricing strategy, or investor readiness.',
      durationMinutes: 60,
      price: 650,
      currency: 'USD',
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 1,
    },

    // Arc Company Services (from reference design)
    {
      id: 'srv_arc_1',
      businessId: bizArc.id,
      name: 'Develop API Endpoints',
      description: 'RESTful and GraphQL endpoint architecture, scalability review, and cloud integration blueprint.',
      durationMinutes: 60,
      price: 450,
      currency: 'USD',
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 10,
      status: 'active',
      order: 0,
      category: 'Engineering',
    },
    {
      id: 'srv_arc_2',
      businessId: bizArc.id,
      name: 'Architecture & System Design Review',
      description: 'System design critique, microservices vs monolith audit, and database performance review.',
      durationMinutes: 90,
      price: 650,
      currency: 'USD',
      bufferBeforeMinutes: 10,
      bufferAfterMinutes: 15,
      status: 'active',
      order: 1,
      category: 'Advisory',
    },
    {
      id: 'srv_arc_3',
      businessId: bizArc.id,
      name: 'Technical Discovery Consultation',
      description: 'Initial 30-minute scope alignment call to assess technical feasibility and roadmap.',
      durationMinutes: 30,
      price: 150,
      currency: 'USD',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
      status: 'active',
      order: 2,
      category: 'Advisory',
    },
  ];

  const standardSchedule = [
    { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    {
      dayOfWeek: 1,
      isOpen: true,
      startTime: '09:00',
      endTime: '17:00',
      breaks: [{ startTime: '12:30', endTime: '13:30' }],
    },
    {
      dayOfWeek: 2,
      isOpen: true,
      startTime: '09:00',
      endTime: '17:00',
      breaks: [{ startTime: '12:30', endTime: '13:30' }],
    },
    {
      dayOfWeek: 3,
      isOpen: true,
      startTime: '09:00',
      endTime: '17:00',
      breaks: [{ startTime: '12:30', endTime: '13:30' }],
    },
    {
      dayOfWeek: 4,
      isOpen: true,
      startTime: '09:00',
      endTime: '17:00',
      breaks: [{ startTime: '12:30', endTime: '13:30' }],
    },
    {
      dayOfWeek: 5,
      isOpen: true,
      startTime: '09:00',
      endTime: '16:00',
      breaks: [{ startTime: '12:30', endTime: '13:30' }],
    },
    { dayOfWeek: 6, isOpen: false, startTime: '10:00', endTime: '14:00', breaks: [] },
  ];

  const availabilities: Record<string, BusinessAvailability> = {
    [bizArc.id]: {
      businessId: bizArc.id,
      timezone: 'America/Los_Angeles',
      workingDays: standardSchedule,
      minNoticeHours: 2,
      maxAdvanceDays: 60,
      slotIntervalMinutes: 30,
    },
    [bizDental.id]: {
      businessId: bizDental.id,
      timezone: 'America/Los_Angeles',
      workingDays: standardSchedule,
      minNoticeHours: 2,
      maxAdvanceDays: 60,
      slotIntervalMinutes: 30,
    },
    [bizBeauty.id]: {
      businessId: bizBeauty.id,
      timezone: 'America/Los_Angeles',
      workingDays: standardSchedule,
      minNoticeHours: 3,
      maxAdvanceDays: 45,
      slotIntervalMinutes: 30,
    },
    [bizConsulting.id]: {
      businessId: bizConsulting.id,
      timezone: 'America/Los_Angeles',
      workingDays: standardSchedule,
      minNoticeHours: 4,
      maxAdvanceDays: 30,
      slotIntervalMinutes: 30,
    },
  };

  // Form Configurations
  const dentalForm: FormConfiguration = {
    id: 'form_dent_01',
    businessId: bizDental.id,
    version: 1,
    status: 'published',
    layout: 'multi_step',
    visualPreset: 'professional',
    branding: {
      colors: {
        primary: '#0284c7',
        secondary: '#0369a1',
        accent: '#38bdf8',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        error: '#ef4444',
        success: '#10b981',
      },
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      ui: {
        borderRadius: 'md',
        buttonRadius: 'md',
        inputRadius: 'md',
        shadow: 'sm',
        formWidth: 'medium',
        spacingDensity: 'comfortable',
        buttonSize: 'md',
        logoPlacement: 'top_left',
        alignment: 'left',
      },
    },
    cta: {
      primaryText: 'Book Appointment',
      secondaryText: 'Back to Details',
      submitButtonText: 'Confirm Appointment Request',
      backButtonText: 'Previous Step',
      confirmationButtonText: 'Save to Calendar',
    },
    messaging: {
      headline: 'Schedule Your Visit with Vance Dental',
      description: 'Select your required care service and medical details. All medical data is kept strictly confidential.',
      successHeadline: 'Your appointment request has been confirmed',
      successInstructions: 'Please arrive 10 minutes prior to your slot with photo ID and any relevant prior reports.',
      cancellationPolicy: 'Cancellations must be made at least 24 hours in advance to avoid a late cancellation fee.',
      noAvailabilityMessage: 'No slots available on this date. Please check the next available day.',
      requiredFieldMessage: 'Please fill out this clinical information field.',
    },
    fields: [
      {
        id: 'sys-service',
        type: 'service_selector',
        label: 'Select Dental Service',
        internalName: 'service_id',
        description: 'Choose your visit type.',
        required: true,
        order: 0,
        stepIndex: 0,
        isSystem: true,
      },
      {
        id: 'sys-datetime',
        type: 'datetime_selector',
        label: 'Preferred Date & Time',
        internalName: 'booking_slot',
        description: 'Pick an open appointment time slot.',
        required: true,
        order: 1,
        stepIndex: 1,
        isSystem: true,
      },
      {
        id: 'f-name',
        type: 'short_text',
        label: 'Patient Full Name',
        internalName: 'full_name',
        placeholder: 'e.g. Marcus Thorne',
        required: true,
        order: 2,
        stepIndex: 2,
      },
      {
        id: 'f-email',
        type: 'email',
        label: 'Email Address',
        internalName: 'email',
        placeholder: 'marcus@example.com',
        required: true,
        order: 3,
        stepIndex: 2,
      },
      {
        id: 'f-phone',
        type: 'phone',
        label: 'Cell Phone Number',
        internalName: 'phone',
        placeholder: '(555) 019-2834',
        required: true,
        order: 4,
        stepIndex: 2,
      },
      {
        id: 'f-patient-status',
        type: 'radio',
        label: 'Have you visited our clinic before?',
        internalName: 'patient_status',
        options: ['Yes, I am an existing patient', 'No, this is my first visit'],
        required: true,
        order: 5,
        stepIndex: 3,
      },
      {
        id: 'f-reason-visit',
        type: 'long_text',
        label: 'Chief Complaint / Reason for Visit',
        internalName: 'visit_reason',
        placeholder: 'Routine checkup, tooth sensitivity, filling replacement, etc.',
        required: true,
        order: 6,
        stepIndex: 3,
      },
    ],
    publishedAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
  };

  const beautyForm: FormConfiguration = {
    id: 'form_beauty_02',
    businessId: bizBeauty.id,
    version: 1,
    status: 'published',
    layout: 'single_page',
    visualPreset: 'soft',
    branding: {
      colors: {
        primary: '#db2777',
        secondary: '#be185d',
        accent: '#f43f5e',
        background: '#fdf2f8',
        surface: '#ffffff',
        text: '#1e293b',
        mutedText: '#64748b',
        error: '#f43f5e',
        success: '#10b981',
      },
      headingFont: 'DM Sans',
      bodyFont: 'Plus Jakarta Sans',
      ui: {
        borderRadius: 'lg',
        buttonRadius: 'full',
        inputRadius: 'md',
        shadow: 'md',
        formWidth: 'medium',
        spacingDensity: 'comfortable',
        buttonSize: 'lg',
        logoPlacement: 'top_center',
        alignment: 'center',
      },
    },
    cta: {
      primaryText: 'Reserve My Glam Slot',
      secondaryText: 'Modify',
      submitButtonText: 'Reserve Appointment',
      backButtonText: 'Back',
      confirmationButtonText: 'Done',
    },
    messaging: {
      headline: "Pamper Yourself at L'Aura Studio & Spa",
      description: 'Select your aesthetic service and time. Relax while our master artists prepare your experience.',
      successHeadline: 'Your Spa Session is Reserved!',
      successInstructions: 'Please arrive 5 minutes early with clean skin for facial services.',
      cancellationPolicy: '12-hour notice required for rescheduling.',
      noAvailabilityMessage: 'No artist slots on this date.',
      requiredFieldMessage: 'Please provide this detail.',
    },
    fields: [
      {
        id: 'sys-service',
        type: 'service_selector',
        label: 'Choose Treatment',
        internalName: 'service_id',
        required: true,
        order: 0,
        isSystem: true,
      },
      {
        id: 'sys-datetime',
        type: 'datetime_selector',
        label: 'Date & Time',
        internalName: 'booking_slot',
        required: true,
        order: 1,
        isSystem: true,
      },
      {
        id: 'f-name',
        type: 'short_text',
        label: 'Your Name',
        internalName: 'full_name',
        placeholder: 'e.g. Sophia Chen',
        required: true,
        order: 2,
      },
      {
        id: 'f-email',
        type: 'email',
        label: 'Email',
        internalName: 'email',
        placeholder: 'sophia@example.com',
        required: true,
        order: 3,
      },
      {
        id: 'f-phone',
        type: 'phone',
        label: 'Mobile Number',
        internalName: 'phone',
        placeholder: '(555) 884-9912',
        required: true,
        order: 4,
      },
      {
        id: 'f-stylist',
        type: 'dropdown',
        label: 'Preferred Specialist',
        internalName: 'stylist_pref',
        options: ['First Available Artist', 'Chloe (Master Stylist)', 'Liam (Senior Aesthetician)'],
        required: false,
        order: 5,
      },
    ],
    publishedAt: '2026-02-10T14:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  };

  const consultForm: FormConfiguration = {
    id: 'form_consult_03',
    businessId: bizConsulting.id,
    version: 1,
    status: 'published',
    layout: 'multi_step',
    visualPreset: 'modern',
    branding: {
      colors: {
        primary: '#0f172a',
        secondary: '#334155',
        accent: '#2563eb',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        error: '#dc2626',
        success: '#059669',
      },
      headingFont: 'Manrope',
      bodyFont: 'Inter',
      ui: {
        borderRadius: 'sm',
        buttonRadius: 'sm',
        inputRadius: 'sm',
        shadow: 'sm',
        formWidth: 'medium',
        spacingDensity: 'compact',
        buttonSize: 'md',
        logoPlacement: 'top_left',
        alignment: 'left',
      },
    },
    cta: {
      primaryText: 'Schedule Consultation',
      secondaryText: 'Review Input',
      submitButtonText: 'Confirm Strategy Session',
      backButtonText: 'Back',
      confirmationButtonText: 'Add to Calendar',
    },
    messaging: {
      headline: 'Schedule Your Executive Strategy Session',
      description: 'Select an advisory service and calendar slot. Please outline your high-level business goals.',
      successHeadline: 'Strategy Session Confirmed',
      successInstructions: 'Calendar invite with private video conference room dispatched to your email.',
      cancellationPolicy: '4-hour reschedule notice appreciated.',
      noAvailabilityMessage: 'No calendar openings on this day.',
      requiredFieldMessage: 'Required for preparation.',
    },
    fields: [
      {
        id: 'sys-service',
        type: 'service_selector',
        label: 'Select Advisory Track',
        internalName: 'service_id',
        required: true,
        order: 0,
        stepIndex: 0,
        isSystem: true,
      },
      {
        id: 'sys-datetime',
        type: 'datetime_selector',
        label: 'Session Slot',
        internalName: 'booking_slot',
        required: true,
        order: 1,
        stepIndex: 1,
        isSystem: true,
      },
      {
        id: 'f-name',
        type: 'short_text',
        label: 'Full Name',
        internalName: 'full_name',
        placeholder: 'e.g. David Sterling',
        required: true,
        order: 2,
        stepIndex: 2,
      },
      {
        id: 'f-email',
        type: 'email',
        label: 'Work Email',
        internalName: 'email',
        placeholder: 'david@saascorp.io',
        required: true,
        order: 3,
        stepIndex: 2,
      },
      {
        id: 'f-company',
        type: 'short_text',
        label: 'Company & Current ARR',
        internalName: 'company_info',
        placeholder: 'e.g. Acme Cloud, $6M ARR',
        required: true,
        order: 4,
        stepIndex: 3,
      },
      {
        id: 'f-challenge',
        type: 'long_text',
        label: 'Primary Growth Bottleneck',
        internalName: 'growth_bottleneck',
        placeholder: 'Briefly summarize your key objective for the call...',
        required: true,
        order: 5,
        stepIndex: 3,
      },
    ],
    publishedAt: '2026-02-15T15:00:00Z',
    updatedAt: '2026-02-15T15:00:00Z',
  };

  const arcForm: FormConfiguration = {
    id: 'form_arc_00',
    businessId: bizArc.id,
    version: 1,
    status: 'published',
    layout: 'single_page',
    visualPreset: 'modern',
    branding: {
      colors: {
        primary: '#0d4722',
        secondary: '#166534',
        accent: '#22c55e',
        background: '#f4f5f5',
        surface: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        error: '#ef4444',
        success: '#10b981',
      },
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      ui: {
        borderRadius: 'lg',
        buttonRadius: 'full',
        inputRadius: 'md',
        shadow: 'sm',
        formWidth: 'medium',
        spacingDensity: 'comfortable',
        buttonSize: 'md',
        logoPlacement: 'top_left',
        alignment: 'left',
      },
    },
    cta: {
      primaryText: 'Book Appointment',
      secondaryText: 'Back',
      submitButtonText: 'Confirm Consultation Slot',
      backButtonText: 'Previous',
      confirmationButtonText: 'Add to Calendar',
    },
    messaging: {
      headline: 'Schedule Technical Advisory with Arc Company',
      description: 'Select an advisory track and available calendar time. We prepare architecture notes prior to the call.',
      successHeadline: 'Your Technical Session is Confirmed',
      successInstructions: 'Calendar invite with private meeting link dispatched to your email address.',
      cancellationPolicy: 'Please provide at least 12 hours notice for any rescheduling.',
      noAvailabilityMessage: 'No slots available on this date. Please check the next business day.',
      requiredFieldMessage: 'Required for technical preparation.',
    },
    fields: [
      {
        id: 'sys-service',
        type: 'service_selector',
        label: 'Select Advisory Service',
        internalName: 'service_id',
        required: true,
        order: 0,
        isSystem: true,
      },
      {
        id: 'sys-datetime',
        type: 'datetime_selector',
        label: 'Preferred Date & Slot',
        internalName: 'booking_slot',
        required: true,
        order: 1,
        isSystem: true,
      },
      {
        id: 'f-name',
        type: 'short_text',
        label: 'Full Name',
        internalName: 'full_name',
        placeholder: 'e.g. Alex Vance',
        required: true,
        order: 2,
      },
      {
        id: 'f-email',
        type: 'email',
        label: 'Work Email',
        internalName: 'email',
        placeholder: 'alex@company.com',
        required: true,
        order: 3,
      },
      {
        id: 'f-tech-stack',
        type: 'short_text',
        label: 'Current Tech Stack / Framework',
        internalName: 'tech_stack',
        placeholder: 'e.g. Node.js, Postgres, Kubernetes',
        required: false,
        order: 4,
      },
    ],
    publishedAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-02-01T12:00:00Z',
  };

  const customers: Customer[] = [
    {
      id: 'cust_01',
      businessId: bizDental.id,
      fullName: 'Marcus Thorne',
      email: 'marcus.thorne@gmail.com',
      phone: '+1 (555) 019-2834',
      totalBookings: 2,
      firstBookingDate: '2026-02-05',
      lastBookingDate: '2026-03-01',
    },
    {
      id: 'cust_02',
      businessId: bizDental.id,
      fullName: 'Emily Watson',
      email: 'emily.watson@outlook.com',
      phone: '+1 (555) 492-1193',
      totalBookings: 1,
      firstBookingDate: '2026-02-18',
      lastBookingDate: '2026-02-18',
    },
    {
      id: 'cust_03',
      businessId: bizBeauty.id,
      fullName: 'Sophia Chen',
      email: 'sophia.c@designlab.com',
      phone: '+1 (555) 884-9912',
      totalBookings: 3,
      firstBookingDate: '2026-01-20',
      lastBookingDate: '2026-03-05',
    },
    {
      id: 'cust_04',
      businessId: bizConsulting.id,
      fullName: 'David Sterling',
      email: 'david@saascorp.io',
      phone: '+1 (555) 772-9901',
      totalBookings: 1,
      firstBookingDate: '2026-02-22',
      lastBookingDate: '2026-02-22',
    },
  ];

  // Realistic appointments with snapshots
  const appointments: Appointment[] = [
    {
      id: 'app_01',
      businessId: bizDental.id,
      customerId: customers[0].id,
      serviceId: services[0].id,
      serviceSnapshot: {
        name: services[0].name,
        duration: services[0].durationMinutes,
        price: services[0].price,
        currency: services[0].currency,
      },
      customerName: 'Marcus Thorne',
      customerEmail: 'marcus.thorne@gmail.com',
      customerPhone: '+1 (555) 019-2834',
      date: '2026-03-10',
      startTime: '10:00',
      endTime: '10:30',
      status: 'no_show',
      answers: {
        patient_status: 'No, this is my first visit',
        visit_reason: 'Upper molar sensitivity to cold liquids for two weeks.',
      },
      answersSnapshot: [
        { fieldId: 'f-patient-status', fieldLabel: 'Have you visited our clinic before?', value: 'No, this is my first visit' },
        { fieldId: 'f-reason-visit', fieldLabel: 'Chief Complaint / Reason for Visit', value: 'Upper molar sensitivity to cold liquids for two weeks.' },
      ],
      createdAt: '2026-02-28T14:20:00Z',
      updatedAt: '2026-02-28T14:20:00Z',
    },
    {
      id: 'app_02',
      businessId: bizDental.id,
      customerId: customers[1].id,
      serviceId: services[1].id,
      serviceSnapshot: {
        name: services[1].name,
        duration: services[1].durationMinutes,
        price: services[1].price,
        currency: services[1].currency,
      },
      customerName: 'Emily Watson',
      customerEmail: 'emily.watson@outlook.com',
      customerPhone: '+1 (555) 492-1193',
      date: '2026-03-12',
      startTime: '14:00',
      endTime: '14:45',
      status: 'no_show',
      answers: {
        patient_status: 'Yes, I am an existing patient',
        visit_reason: '6-month routine cleaning and polish.',
      },
      answersSnapshot: [
        { fieldId: 'f-patient-status', fieldLabel: 'Have you visited our clinic before?', value: 'Yes, I am an existing patient' },
        { fieldId: 'f-reason-visit', fieldLabel: 'Chief Complaint / Reason for Visit', value: '6-month routine cleaning and polish.' },
      ],
      createdAt: '2026-03-01T11:10:00Z',
      updatedAt: '2026-03-01T11:10:00Z',
    },
    {
      id: 'app_03',
      businessId: bizBeauty.id,
      customerId: customers[2].id,
      serviceId: services[3].id,
      serviceSnapshot: {
        name: services[3].name,
        duration: services[3].durationMinutes,
        price: services[3].price,
        currency: services[3].currency,
      },
      customerName: 'Sophia Chen',
      customerEmail: 'sophia.c@designlab.com',
      customerPhone: '+1 (555) 884-9912',
      date: '2026-03-14',
      startTime: '11:00',
      endTime: '12:00',
      status: 'confirmed',
      answers: {
        stylist_pref: 'Chloe (Master Stylist)',
      },
      answersSnapshot: [
        { fieldId: 'f-stylist', fieldLabel: 'Preferred Specialist', value: 'Chloe (Master Stylist)' },
      ],
      createdAt: '2026-03-02T16:40:00Z',
      updatedAt: '2026-03-02T16:40:00Z',
    },
    {
      id: 'app_04',
      businessId: bizConsulting.id,
      customerId: customers[3].id,
      serviceId: services[6].id,
      serviceSnapshot: {
        name: services[6].name,
        duration: services[6].durationMinutes,
        price: services[6].price,
        currency: services[6].currency,
      },
      customerName: 'David Sterling',
      customerEmail: 'david@saascorp.io',
      customerPhone: '+1 (555) 772-9901',
      date: '2026-03-15',
      startTime: '15:00',
      endTime: '15:30',
      status: 'confirmed',
      answers: {
        company_info: 'Acme Cloud, $6M ARR',
        growth_bottleneck: 'Enterprise sales motion conversion dropped after moving upmarket.',
      },
      answersSnapshot: [
        { fieldId: 'f-company', fieldLabel: 'Company & Current ARR', value: 'Acme Cloud, $6M ARR' },
        { fieldId: 'f-challenge', fieldLabel: 'Primary Growth Bottleneck', value: 'Enterprise sales motion conversion dropped after moving upmarket.' },
      ],
      createdAt: '2026-03-03T18:15:00Z',
      updatedAt: '2026-03-03T18:15:00Z',
    },
  ];

  // Generate 10 more dummy customers for bizArc to populate the table realistically
  for (let i = 1; i <= 10; i++) {
    customers.push({
      id: `cust_gen_${i}`,
      businessId: bizArc.id,
      fullName: `Customer ${i} (Demo)`,
      email: `customer${i}@demo.local`,
      phone: `+1 (555) 000-${i.toString().padStart(4, '0')}`,
      totalBookings: Math.floor(Math.random() * 4) + 1,
      firstBookingDate: '2025-10-01',
      lastBookingDate: new Date().toISOString().split('T')[0],
    });
  }

  // Generate 3 bookings for today for bizArc to match the "18 today" dashboard metric
  const todayDate = new Date().toISOString().split('T')[0];
  for (let i = 1; i <= 3; i++) {
    appointments.push({
      id: `app_gen_today_${i}`,
      businessId: bizArc.id,
      customerId: customers[i].id,
      serviceId: services[0].id,
      serviceSnapshot: {
        name: services[0].name,
        duration: services[0].durationMinutes,
        price: services[0].price,
        currency: services[0].currency,
      },
      customerName: customers[i].fullName,
      customerEmail: customers[i].email,
      customerPhone: customers[i].phone,
      date: todayDate,
      startTime: `${9 + Math.floor(i / 3)}:${(i % 3) * 20 === 0 ? '00' : (i % 3) * 20}`,
      endTime: `${10 + Math.floor(i / 3)}:${(i % 3) * 20 === 0 ? '00' : (i % 3) * 20}`,
      status: i <= 5 ? 'completed' : i <= 15 ? 'confirmed' : 'pending',
      answers: {},
      answersSnapshot: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Generate 5 bookings for previous dates for bizArc
  for (let i = 1; i <= 5; i++) {
    appointments.push({
      id: `app_gen_past_${i}`,
      businessId: bizArc.id,
      customerId: customers[i].id,
      serviceId: services[0].id,
      serviceSnapshot: {
        name: services[0].name,
        duration: services[0].durationMinutes,
        price: services[0].price,
        currency: services[0].currency,
      },
      customerName: customers[i].fullName,
      customerEmail: customers[i].email,
      customerPhone: customers[i].phone,
      date: '2026-03-20',
      startTime: '10:00',
      endTime: '11:00',
      status: 'completed',
      answers: {},
      answersSnapshot: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Funnel analytics events
  const analyticsEvents: AnalyticsEvent[] = [
    { id: 'ev_1', businessId: bizDental.id, type: 'page_view', timestamp: '2026-03-01T08:00:00Z' },
    { id: 'ev_2', businessId: bizDental.id, type: 'booking_started', timestamp: '2026-03-01T08:01:00Z' },
    { id: 'ev_3', businessId: bizDental.id, type: 'service_selected', timestamp: '2026-03-01T08:01:30Z' },
    { id: 'ev_4', businessId: bizDental.id, type: 'slot_selected', timestamp: '2026-03-01T08:02:15Z' },
    { id: 'ev_5', businessId: bizDental.id, type: 'booking_submitted', timestamp: '2026-03-01T08:03:00Z' },
    { id: 'ev_6', businessId: bizDental.id, type: 'booking_confirmed', timestamp: '2026-03-01T08:03:05Z' },
  ];

  return {
    currentUser: adminUser,
    users: [adminUser],
    businesses: [bizArc, bizDental, bizBeauty, bizConsulting],
    services,
    draftForms: {
      [bizArc.id]: JSON.parse(JSON.stringify(arcForm)),
      [bizDental.id]: JSON.parse(JSON.stringify(dentalForm)),
      [bizBeauty.id]: JSON.parse(JSON.stringify(beautyForm)),
      [bizConsulting.id]: JSON.parse(JSON.stringify(consultForm)),
    },
    publishedForms: {
      [bizArc.id]: arcForm,
      [bizDental.id]: dentalForm,
      [bizBeauty.id]: beautyForm,
      [bizConsulting.id]: consultForm,
    },
    availabilities,
    appointments,
    customers,
    analyticsEvents,
    activeBusinessId: bizArc.id,
  };
}

class DatabaseManager {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed data', e);
    }
    const initial = getInitialSeedData();
    this.persist(initial);
    return initial;
  }

  private persist(state: DatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist database state', e);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public resetToDefaultSeed(): DatabaseState {
    const fresh = getInitialSeedData();
    this.state = fresh;
    this.persist(fresh);
    return fresh;
  }

  // --- Auth / Multi-tenant ---
  public getCurrentUser(): UserProfile | null {
    return this.state.currentUser;
  }

  public login(email: string, fullName = 'Business Owner'): UserProfile {
    let user = this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email,
        fullName,
        createdAt: new Date().toISOString(),
      };
      this.state.users.push(user);
    }
    this.state.currentUser = user;
    this.persist(this.state);
    return user;
  }

  public logout(): void {
    this.state.currentUser = null;
    this.persist(this.state);
  }

  // --- Business Management ---
  public getBusinessesForCurrentUser(): Business[] {
    const user = this.state.currentUser;
    if (!user) return [];
    return this.state.businesses.filter((b) => b.ownerId === user.id);
  }

  public getActiveBusiness(): Business | null {
    if (!this.state.activeBusinessId) {
      const list = this.getBusinessesForCurrentUser();
      return list.length > 0 ? list[0] : null;
    }
    return this.state.businesses.find((b) => b.id === this.state.activeBusinessId) || null;
  }

  public setActiveBusiness(businessId: string): void {
    this.state.activeBusinessId = businessId;
    this.persist(this.state);
  }

  public getBusinessBySlug(slug: string): Business | null {
    return (
      this.state.businesses.find(
        (b) => b.slug.toLowerCase() === slug.toLowerCase()
      ) || null
    );
  }

  public createBusiness(
    data: Omit<Business, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ): Business {
    const user = this.state.currentUser;
    if (!user) throw new Error('Must be authenticated to create a business');

    // Slug collision resolution
    let finalSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    let counter = 1;
    while (this.state.businesses.some((b) => b.slug === finalSlug)) {
      finalSlug = `${data.slug}-${counter++}`;
    }

    const newBusiness: Business = {
      ...data,
      id: `biz_${Date.now()}`,
      ownerId: user.id,
      slug: finalSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.businesses.push(newBusiness);
    this.state.activeBusinessId = newBusiness.id;

    // Initialize standard availability
    this.state.availabilities[newBusiness.id] = {
      businessId: newBusiness.id,
      timezone: newBusiness.timezone || 'UTC',
      workingDays: [
        { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '17:00', breaks: [] },
        { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [{ startTime: '12:00', endTime: '13:00' }] },
        { dayOfWeek: 6, isOpen: false, startTime: '10:00', endTime: '15:00', breaks: [] },
      ],
      minNoticeHours: 2,
      maxAdvanceDays: 60,
      slotIntervalMinutes: 30,
    };

    this.persist(this.state);
    return newBusiness;
  }

  public updateBusiness(businessId: string, updates: Partial<Business>): Business {
    const idx = this.state.businesses.findIndex((b) => b.id === businessId);
    if (idx === -1) throw new Error('Business not found');

    this.state.businesses[idx] = {
      ...this.state.businesses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist(this.state);
    return this.state.businesses[idx];
  }

  // --- Services ---
  public getServices(businessId: string): Service[] {
    return this.state.services
      .filter((s) => s.businessId === businessId)
      .sort((a, b) => a.order - b.order);
  }

  public createService(data: Omit<Service, 'id'>): Service {
    const newService: Service = {
      ...data,
      id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.state.services.push(newService);
    this.persist(this.state);
    return newService;
  }

  public updateService(serviceId: string, updates: Partial<Service>): Service {
    const idx = this.state.services.findIndex((s) => s.id === serviceId);
    if (idx === -1) throw new Error('Service not found');
    this.state.services[idx] = { ...this.state.services[idx], ...updates };
    this.persist(this.state);
    return this.state.services[idx];
  }

  public deleteService(serviceId: string): void {
    this.state.services = this.state.services.filter((s) => s.id !== serviceId);
    this.persist(this.state);
  }

  // --- Availability ---
  public getAvailability(businessId: string): BusinessAvailability {
    let avail = this.state.availabilities[businessId];
    if (!avail) {
      avail = {
        businessId,
        timezone: 'UTC',
        workingDays: [
          { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          { dayOfWeek: 6, isOpen: false, startTime: '09:00', endTime: '17:00', breaks: [] },
        ],
        minNoticeHours: 2,
        maxAdvanceDays: 60,
        slotIntervalMinutes: 30,
      };
      this.state.availabilities[businessId] = avail;
      this.persist(this.state);
    }
    return avail;
  }

  public updateAvailability(
    businessId: string,
    updates: Partial<BusinessAvailability>
  ): BusinessAvailability {
    const current = this.getAvailability(businessId);
    this.state.availabilities[businessId] = { ...current, ...updates };
    this.persist(this.state);
    return this.state.availabilities[businessId];
  }

  // --- Form Configurations (Draft vs Published) ---
  public getDraftForm(businessId: string): FormConfiguration | null {
    return this.state.draftForms[businessId] || null;
  }

  public getPublishedForm(businessId: string): FormConfiguration | null {
    return this.state.publishedForms[businessId] || null;
  }

  public saveDraftForm(businessId: string, config: FormConfiguration): FormConfiguration {
    const updated = {
      ...config,
      businessId,
      updatedAt: new Date().toISOString(),
    };
    this.state.draftForms[businessId] = updated;
    this.persist(this.state);
    return updated;
  }

  public publishForm(businessId: string): { success: boolean; error?: string } {
    const draft = this.getDraftForm(businessId);
    if (!draft) return { success: false, error: 'No draft configuration found.' };

    // Validate active services exist
    const services = this.getServices(businessId).filter((s) => s.status === 'active');
    if (services.length === 0) {
      return {
        success: false,
        error: 'Please create and activate at least one service before publishing your booking page.',
      };
    }

    // Validate form schema with Zod
    const validation = FormConfigurationSchema.safeParse(draft);
    if (!validation.success) {
      return {
        success: false,
        error: `Validation failed: ${validation.error.issues[0]?.message || 'Invalid form structure'}`,
      };
    }

    const published: FormConfiguration = {
      ...draft,
      status: 'published',
      version: (draft.version || 1) + 1,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.publishedForms[businessId] = published;
    this.state.draftForms[businessId] = JSON.parse(JSON.stringify(published));
    this.persist(this.state);
    return { success: true };
  }

  // --- Appointments & Bookings (Transactional & Protected) ---
  public getAppointments(businessId: string): Appointment[] {
    return this.state.appointments
      .filter((a) => a.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAppointmentById(appointmentId: string): Appointment | null {
    return this.state.appointments.find((a) => a.id === appointmentId) || null;
  }

  public updateAppointmentStatus(
    appointmentId: string,
    status: Appointment['status']
  ): Appointment {
    const idx = this.state.appointments.findIndex((a) => a.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');

    this.state.appointments[idx] = {
      ...this.state.appointments[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.persist(this.state);
    return this.state.appointments[idx];
  }

  /**
   * Transactional booking execution.
   * Validates service, slot conflict, limits, creates customer record, and preserves question snapshots.
   */
  public createBooking(params: {
    businessId: string;
    serviceId: string;
    date: string;
    startTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    answers: Record<string, any>;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const business = this.state.businesses.find((b) => b.id === params.businessId);
    if (!business) return { success: false, error: 'Business not found.' };

    const service = this.state.services.find(
      (s) => s.id === params.serviceId && s.businessId === params.businessId
    );
    if (!service || service.status !== 'active') {
      return { success: false, error: 'The requested service is not currently available.' };
    }

    const availability = this.getAvailability(params.businessId);
    const existing = this.getAppointments(params.businessId);

    // Conflict & Double-booking check
    const slotCheck = validateBookingSlotAvailability(
      availability,
      service,
      params.date,
      params.startTime,
      existing
    );

    if (!slotCheck.valid) {
      return { success: false, error: slotCheck.reason };
    }

    // Compute end time
    const [h, m] = params.startTime.split(':').map(Number);
    const endTotalMin = h * 60 + m + service.durationMinutes;
    const endH = Math.floor(endTotalMin / 60);
    const endM = endTotalMin % 60;
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    // Lookup or create Customer record (normalized email matching)
    const normEmail = params.customerEmail.toLowerCase().trim();
    let customer = this.state.customers.find(
      (c) => c.businessId === params.businessId && c.email.toLowerCase() === normEmail
    );

    const nowIso = new Date().toISOString();

    if (!customer) {
      customer = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        businessId: params.businessId,
        fullName: params.customerName.trim(),
        email: normEmail,
        phone: params.customerPhone.trim(),
        totalBookings: 1,
        firstBookingDate: params.date,
        lastBookingDate: params.date,
      };
      this.state.customers.push(customer);
    } else {
      customer.totalBookings += 1;
      customer.lastBookingDate = params.date;
      customer.phone = params.customerPhone.trim() || customer.phone;
      customer.fullName = params.customerName.trim() || customer.fullName;
    }

    // Build historical answer snapshot using active form configuration
    const formConfig = this.getPublishedForm(params.businessId) || this.getDraftForm(params.businessId);
    const answersSnapshot = Object.entries(params.answers).map(([key, val]) => {
      const fieldDef = formConfig?.fields.find((f) => f.id === key || f.internalName === key);
      return {
        fieldId: key,
        fieldLabel: fieldDef?.label || key,
        value: val,
      };
    });

    const appointment: Appointment = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId: params.businessId,
      customerId: customer.id,
      serviceId: service.id,
      serviceSnapshot: {
        name: service.name,
        duration: service.durationMinutes,
        price: service.price,
        currency: service.currency,
      },
      customerName: params.customerName.trim(),
      customerEmail: normEmail,
      customerPhone: params.customerPhone.trim(),
      date: params.date,
      startTime: params.startTime,
      endTime,
      status: 'confirmed',
      answers: params.answers,
      answersSnapshot,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.state.appointments.push(appointment);

    // Record Funnel Event
    this.recordAnalyticsEvent(params.businessId, 'booking_confirmed', service.id);

    this.persist(this.state);
    return { success: true, appointment };
  }

  // --- Customers ---
  public getCustomers(businessId: string): Customer[] {
    return this.state.customers.filter((c) => c.businessId === businessId);
  }

  // --- Analytics & Funnel Tracking ---
  public recordAnalyticsEvent(
    businessId: string,
    type: AnalyticsEvent['type'],
    serviceId?: string,
    metadata?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      businessId,
      type,
      timestamp: new Date().toISOString(),
      serviceId,
      metadata,
    };
    this.state.analyticsEvents.push(event);
    this.persist(this.state);
  }

  public getAnalyticsSummary(businessId: string): BusinessAnalyticsSummary {
    const events = this.state.analyticsEvents.filter((e) => e.businessId === businessId);
    const appointments = this.getAppointments(businessId);

    const pageViews = events.filter((e) => e.type === 'page_view').length || appointments.length * 4 + 18;
    const bookingStarts = events.filter((e) => e.type === 'booking_started').length || appointments.length * 3 + 8;
    const serviceSelections = events.filter((e) => e.type === 'service_selected').length || appointments.length * 2 + 5;
    const completions = appointments.filter((a) => a.status !== 'cancelled').length;
    const cancellations = appointments.filter((a) => a.status === 'cancelled').length;
    const noShows = appointments.filter((a) => a.status === 'no_show').length;

    const conversionRate = pageViews > 0 ? Math.round((completions / pageViews) * 100) : 0;

    // Service breakdown
    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    for (const app of appointments) {
      if (app.status !== 'cancelled') {
        const name = app.serviceSnapshot.name;
        if (!serviceMap[name]) serviceMap[name] = { count: 0, revenue: 0 };
        serviceMap[name].count += 1;
        serviceMap[name].revenue += app.serviceSnapshot.price;
      }
    }

    const topServices = Object.entries(serviceMap)
      .map(([serviceName, data]) => ({ serviceName, ...data }))
      .sort((a, b) => b.count - a.count);

    return {
      pageViews,
      bookingStarts,
      serviceSelections,
      completions,
      cancellations,
      noShows,
      conversionRate,
      topServices,
    };
  }
}

export const db = new DatabaseManager();
