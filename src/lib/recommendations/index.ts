import {
  IndustryCategory,
  BookingModelType,
  TargetAudience,
  FormField,
  FormLayoutType,
  FormVisualPreset,
  BrandColors,
  CTAConfig,
  MessagingConfig,
  FontFamilyChoice,
  UIConfiguration,
} from '../../types';

export interface RecommendationResult {
  industryTitle: string;
  rationale: string;
  recommendedLayout: FormLayoutType;
  recommendedPreset: FormVisualPreset;
  recommendedColors: BrandColors;
  recommendedHeadingFont: FontFamilyChoice;
  recommendedBodyFont: FontFamilyChoice;
  recommendedUI: UIConfiguration;
  recommendedCTA: CTAConfig;
  recommendedMessaging: MessagingConfig;
  recommendedFields: FormField[];
  highlightedBenefits: string[];
}

// System core fields that must always exist
export const createSystemFields = (): FormField[] => [
  {
    id: 'sys-service',
    type: 'service_selector',
    label: 'Select Service',
    internalName: 'service_id',
    description: 'Choose the treatment, consultation, or session you require.',
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
    description: 'Select an available date and timeslot in business hours.',
    required: true,
    order: 1,
    stepIndex: 1,
    isSystem: true,
  },
];

export function generateRecommendation(
  industry: IndustryCategory,
  niche: string,
  audience: TargetAudience,
  bookingModel: BookingModelType,
  businessName: string
): RecommendationResult {
  const commonCustomerFields: FormField[] = [
    {
      id: 'f-name',
      type: 'short_text',
      label: 'Full Name',
      internalName: 'full_name',
      placeholder: 'e.g. Jane Doe',
      required: true,
      order: 2,
      stepIndex: 2,
    },
    {
      id: 'f-email',
      type: 'email',
      label: 'Email Address',
      internalName: 'email',
      placeholder: 'jane@example.com',
      description: 'We will send your booking confirmation and reminders here.',
      required: true,
      order: 3,
      stepIndex: 2,
    },
    {
      id: 'f-phone',
      type: 'phone',
      label: 'Phone Number',
      internalName: 'phone',
      placeholder: '+1 (555) 000-0000',
      description: 'Used for important appointment updates.',
      required: true,
      order: 4,
      stepIndex: 2,
    },
  ];

  switch (industry) {
    case 'healthcare': {
      return {
        industryTitle: 'Healthcare & Clinical Practice',
        rationale:
          'High emphasis on patient privacy, emergency triage questions, previous medical history, and clear visit reasons.',
        recommendedLayout: 'multi_step',
        recommendedPreset: 'professional',
        recommendedColors: {
          primary: '#0284c7', // sky-600
          secondary: '#0369a1',
          accent: '#0ea5e9',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#ef4444',
          success: '#10b981',
        },
        recommendedHeadingFont: 'Plus Jakarta Sans',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Book Appointment',
          secondaryText: 'Back to Details',
          submitButtonText: 'Confirm Appointment Request',
          backButtonText: 'Previous Step',
          confirmationButtonText: 'Save to Calendar',
        },
        recommendedMessaging: {
          headline: `Schedule Your Visit with ${businessName || 'Our Clinic'}`,
          description:
            'Please select your required care service and medical details. All medical data is kept strictly confidential.',
          successHeadline: 'Your appointment request has been confirmed',
          successInstructions:
            'Please arrive 10 minutes prior to your slot with photo ID and any relevant prior reports.',
          cancellationPolicy:
            'Cancellations must be made at least 24 hours in advance to avoid a late cancellation fee.',
          noAvailabilityMessage:
            'No slots available on this date. Please check the next available day.',
          requiredFieldMessage: 'Please fill out this clinical information field.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-patient-status',
            type: 'radio',
            label: 'Have you visited our clinic before?',
            internalName: 'patient_status',
            required: true,
            options: ['Yes, I am an existing patient', 'No, this is my first visit'],
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-reason-visit',
            type: 'long_text',
            label: 'Chief Complaint / Reason for Visit',
            internalName: 'visit_reason',
            placeholder: 'Briefly describe your symptoms or reason for scheduling...',
            required: true,
            order: 6,
            stepIndex: 3,
          },
          {
            id: 'f-consent',
            type: 'consent_checkbox',
            label: 'I consent to clinical record keeping and SMS appointment notifications.',
            internalName: 'privacy_consent',
            required: true,
            order: 7,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Pre-screens new vs existing patients',
          'Captures medical reason in advance to prepare provider',
          'Enforces HIPAA-friendly privacy consent',
        ],
      };
    }

    case 'beauty': {
      return {
        industryTitle: 'Beauty, Salon & Wellness Studio',
        rationale:
          'Focuses on visual elegance, preferred stylist or artist, hair/skin preferences, and pre-care notes.',
        recommendedLayout: 'single_page',
        recommendedPreset: 'soft',
        recommendedColors: {
          primary: '#db2777', // pink-600
          secondary: '#be185d',
          accent: '#f43f5e',
          background: '#fdf2f8',
          surface: '#ffffff',
          text: '#1e293b',
          mutedText: '#64748b',
          error: '#f43f5e',
          success: '#10b981',
        },
        recommendedHeadingFont: 'DM Sans',
        recommendedBodyFont: 'Plus Jakarta Sans',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Reserve My Glam Slot',
          secondaryText: 'Edit Details',
          submitButtonText: 'Reserve Appointment',
          backButtonText: 'Back',
          confirmationButtonText: 'Done',
        },
        recommendedMessaging: {
          headline: `Treat Yourself at ${businessName || 'Our Studio'}`,
          description:
            'Select your desired treatment and favorite time. We look forward to pampering you!',
          successHeadline: 'Your booking is secured!',
          successInstructions:
            'Please arrive with clean skin or hair as applicable for your chosen treatment.',
          cancellationPolicy:
            'Please notify us at least 12 hours before your appointment for any rescheduling.',
          noAvailabilityMessage: 'All stylists are fully booked for this date.',
          requiredFieldMessage: 'This detail helps us personalize your look.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-preferred-stylist',
            type: 'dropdown',
            label: 'Preferred Specialist / Stylist',
            internalName: 'preferred_stylist',
            options: ['Any Available Specialist', 'Senior Stylist', 'Master Aesthetician'],
            required: false,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-special-requests',
            type: 'long_text',
            label: 'Allergies, Skin Sensitivities or Style Inspiration',
            internalName: 'beauty_notes',
            placeholder: 'Let us know if you have any sensitivities or specific requests...',
            required: false,
            order: 6,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Gentle and inviting brand aesthetics',
          'Captures stylist preference without blocking checkout',
          'Records allergies or sensitivities prior to treatments',
        ],
      };
    }

    case 'consulting':
    case 'professional_services': {
      return {
        industryTitle: 'Consulting & Professional Services',
        rationale:
          'Structured around qualified B2B leads, business challenge clarity, company details, and meeting format.',
        recommendedLayout: 'multi_step',
        recommendedPreset: 'modern',
        recommendedColors: {
          primary: '#0f172a', // slate-900
          secondary: '#334155',
          accent: '#2563eb',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#dc2626',
          success: '#059669',
        },
        recommendedHeadingFont: 'Manrope',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Schedule Consultation',
          secondaryText: 'Review Input',
          submitButtonText: 'Confirm Strategy Session',
          backButtonText: 'Back',
          confirmationButtonText: 'Add to Google / Outlook',
        },
        recommendedMessaging: {
          headline: `Schedule Your Strategy Session with ${businessName || 'Us'}`,
          description:
            'Choose a convenient time on our calendar. Share a few details about your objectives so we can review before the call.',
          successHeadline: 'Strategy Session Confirmed',
          successInstructions:
            'A calendar invite with video conference link has been dispatched to your email.',
          cancellationPolicy:
            'Need to reschedule? Please do so at least 4 hours ahead using the link in your email.',
          noAvailabilityMessage: 'No calendar openings on this date.',
          requiredFieldMessage: 'Please provide this business information.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-company-name',
            type: 'short_text',
            label: 'Company / Organization Name',
            internalName: 'company_name',
            placeholder: 'e.g. Acme Corp',
            required: true,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-meeting-type',
            type: 'dropdown',
            label: 'Preferred Meeting Location',
            internalName: 'meeting_medium',
            options: ['Google Meet / Zoom', 'Phone Call', 'In-Person at Office'],
            required: true,
            order: 6,
            stepIndex: 3,
          },
          {
            id: 'f-business-challenge',
            type: 'long_text',
            label: 'What primary challenge or goal would you like to discuss?',
            internalName: 'business_challenge',
            placeholder: 'Provide 2-3 sentences regarding what you are trying to solve...',
            required: true,
            order: 7,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Pre-qualifies incoming prospects before the call',
          'Professional, confidence-inspiring typography and contrast',
          'Collects company domain and meeting preference',
        ],
      };
    }

    case 'fitness': {
      return {
        industryTitle: 'Fitness, Coaching & Personal Training',
        rationale:
          'High energy presentation, fitness goals qualification, and physical readiness waiver.',
        recommendedLayout: 'single_page',
        recommendedPreset: 'modern',
        recommendedColors: {
          primary: '#ea580c', // orange-600
          secondary: '#c2410c',
          accent: '#f97316',
          background: '#fff7ed',
          surface: '#ffffff',
          text: '#1c1917',
          mutedText: '#78716c',
          error: '#ef4444',
          success: '#16a34a',
        },
        recommendedHeadingFont: 'Poppins',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
          borderRadius: 'md',
          buttonRadius: 'md',
          inputRadius: 'md',
          shadow: 'md',
          formWidth: 'medium',
          spacingDensity: 'comfortable',
          buttonSize: 'lg',
          logoPlacement: 'top_center',
          alignment: 'center',
        },
        recommendedCTA: {
          primaryText: 'Book Training Session',
          secondaryText: 'Modify',
          submitButtonText: 'Lock In My Session',
          backButtonText: 'Back',
          confirmationButtonText: 'View Details',
        },
        recommendedMessaging: {
          headline: `Book Your Training with ${businessName || 'Coach'}`,
          description:
            'Select your workout session or 1-on-1 assessment and lock in your training spot.',
          successHeadline: "You're Locked In!",
          successInstructions:
            'Bring workout shoes, a water bottle, and arrive 5 minutes early to warm up.',
          cancellationPolicy: '12-hour cancellation notice required.',
          noAvailabilityMessage: 'No gym slots available on this day.',
          requiredFieldMessage: 'Required for coach safety preparation.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-fitness-level',
            type: 'dropdown',
            label: 'Current Fitness Level',
            internalName: 'fitness_level',
            options: ['Beginner (0-6 months)', 'Intermediate (1-2 years)', 'Advanced athlete'],
            required: true,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-injuries',
            type: 'short_text',
            label: 'Any prior injuries or physical restrictions?',
            internalName: 'injuries_note',
            placeholder: 'e.g. Lower back stiffness, none, etc.',
            required: false,
            order: 6,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'High energy athletic aesthetic',
          'Screens for injuries and experience level',
          'Fast single-step frictionless checkout',
        ],
      };
    }

    case 'home_services': {
      return {
        industryTitle: 'Home & Field Services',
        rationale:
          'Requires physical property address, access instructions, and emergency or service urgency indicators.',
        recommendedLayout: 'multi_step',
        recommendedPreset: 'compact',
        recommendedColors: {
          primary: '#15803d', // green-700
          secondary: '#166534',
          accent: '#22c55e',
          background: '#f0fdf4',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#ef4444',
          success: '#10b981',
        },
        recommendedHeadingFont: 'Inter',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Schedule Service Dispatch',
          secondaryText: 'Back',
          submitButtonText: 'Confirm Service Visit',
          backButtonText: 'Back',
          confirmationButtonText: 'Finish',
        },
        recommendedMessaging: {
          headline: `Schedule Service with ${businessName || 'Our Technicians'}`,
          description:
            'Select your required repair or installation service and provide your location.',
          successHeadline: 'Service Appointment Requested',
          successInstructions:
            'Our technician will call or text 30 minutes before arrival at your address.',
          cancellationPolicy: 'Please cancel at least 3 hours prior to technician dispatch.',
          noAvailabilityMessage: 'All service technicians are booked for this date.',
          requiredFieldMessage: 'Service address is required.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-service-address',
            type: 'address',
            label: 'Service Location / Street Address',
            internalName: 'service_address',
            placeholder: '123 Main St, Apt 4B, City, State, ZIP',
            required: true,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-property-type',
            type: 'radio',
            label: 'Property Type',
            internalName: 'property_type',
            options: ['Single Family Home', 'Apartment / Condo', 'Commercial Space'],
            required: true,
            order: 6,
            stepIndex: 3,
          },
          {
            id: 'f-gate-code',
            type: 'short_text',
            label: 'Gate code or parking instructions (optional)',
            internalName: 'access_instructions',
            placeholder: 'e.g. Ring code #104 or park in driveway',
            required: false,
            order: 7,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Collects exact physical job site address',
          'Streamlines technician arrival instructions',
          'Prevents missed dispatch visits',
        ],
      };
    }

    case 'real_estate': {
      return {
        industryTitle: 'Real Estate & Property Viewings',
        rationale:
          'Qualified buyer pre-checks, property interest identification, and scheduling tours.',
        recommendedLayout: 'multi_step',
        recommendedPreset: 'premium',
        recommendedColors: {
          primary: '#1e3a8a', // blue-900
          secondary: '#172554',
          accent: '#b45309', // amber-700
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#ef4444',
          success: '#10b981',
        },
        recommendedHeadingFont: 'DM Sans',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
          borderRadius: 'sm',
          buttonRadius: 'sm',
          inputRadius: 'sm',
          shadow: 'md',
          formWidth: 'medium',
          spacingDensity: 'comfortable',
          buttonSize: 'md',
          logoPlacement: 'top_left',
          alignment: 'left',
        },
        recommendedCTA: {
          primaryText: 'Schedule Property Viewing',
          secondaryText: 'Back',
          submitButtonText: 'Confirm Showing Request',
          backButtonText: 'Back',
          confirmationButtonText: 'Done',
        },
        recommendedMessaging: {
          headline: `Schedule a Private Tour with ${businessName || 'Our Agents'}`,
          description: 'Reserve an exclusive guided walk-through of the property.',
          successHeadline: 'Tour Request Submitted',
          successInstructions:
            'Our agent will meet you at the property at the chosen time. Look out for an SMS confirmation.',
          cancellationPolicy: '24-hour notice requested.',
          noAvailabilityMessage: 'No showings available on this date.',
          requiredFieldMessage: 'Required for real estate showing compliance.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-property-address',
            type: 'short_text',
            label: 'Property Address or MLS # of Interest',
            internalName: 'property_target',
            placeholder: 'e.g. 742 Evergreen Terrace',
            required: true,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-buyer-stage',
            type: 'dropdown',
            label: 'Financing / Purchasing Stage',
            internalName: 'buyer_stage',
            options: [
              'Pre-approved for mortgage',
              'Cash buyer',
              'Looking to sell first',
              'Just exploring',
            ],
            required: true,
            order: 6,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Pre-qualifies buyer readiness stage',
          'Tracks specific property reference numbers',
          'Luxury branded feel for high-value transactions',
        ],
      };
    }

    case 'education': {
      return {
        industryTitle: 'Education, Tutoring & Academic Mentorship',
        rationale:
          'Gathers student grade level, subject matter curriculum, and learning goals.',
        recommendedLayout: 'single_page',
        recommendedPreset: 'modern',
        recommendedColors: {
          primary: '#4f46e5', // indigo-600
          secondary: '#3730a3',
          accent: '#6366f1',
          background: '#eef2ff',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#ef4444',
          success: '#10b981',
        },
        recommendedHeadingFont: 'Plus Jakarta Sans',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Book Tutoring Session',
          secondaryText: 'Back',
          submitButtonText: 'Reserve Tutoring Slot',
          backButtonText: 'Back',
          confirmationButtonText: 'Save to Calendar',
        },
        recommendedMessaging: {
          headline: `Schedule Your Lesson with ${businessName || 'Our Instructors'}`,
          description:
            'Select your subject, date, and tell us what topics you need help mastering.',
          successHeadline: 'Lesson Confirmed!',
          successInstructions:
            'Have your textbook, homework or notes ready before the session begins.',
          cancellationPolicy: 'Reschedule anytime up to 6 hours before session.',
          noAvailabilityMessage: 'No lesson slots on this day.',
          requiredFieldMessage: 'Required for teacher lesson preparation.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-student-name',
            type: 'short_text',
            label: "Student's Name (if different from contact)",
            internalName: 'student_name',
            placeholder: 'e.g. Alex Doe',
            required: false,
            order: 5,
            stepIndex: 3,
          },
          {
            id: 'f-subject-level',
            type: 'dropdown',
            label: 'Subject & Grade Level',
            internalName: 'subject_level',
            options: [
              'Primary / Middle School Math',
              'High School Sciences / AP',
              'College / University Prep',
              'Language & Writing',
              'Coding & Technology',
            ],
            required: true,
            order: 6,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'Clarifies whether booking is for parent or student',
          'Enables tutor curriculum prep before lesson',
        ],
      };
    }

    // Default / General
    default: {
      return {
        industryTitle: 'Universal Appointment & Booking',
        rationale:
          'Balanced, high-conversion appointment flow adaptable to any small business model.',
        recommendedLayout: 'single_page',
        recommendedPreset: 'modern',
        recommendedColors: {
          primary: '#2563eb', // blue-600
          secondary: '#1d4ed8',
          accent: '#3b82f6',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#0f172a',
          mutedText: '#64748b',
          error: '#ef4444',
          success: '#10b981',
        },
        recommendedHeadingFont: 'Inter',
        recommendedBodyFont: 'Inter',
        recommendedUI: {
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
        recommendedCTA: {
          primaryText: 'Book Appointment',
          secondaryText: 'Back',
          submitButtonText: 'Confirm Booking',
          backButtonText: 'Back',
          confirmationButtonText: 'Done',
        },
        recommendedMessaging: {
          headline: `Book an Appointment with ${businessName || 'Us'}`,
          description:
            'Choose your preferred service, date, and time. We will send immediate confirmation.',
          successHeadline: 'Booking Confirmed!',
          successInstructions:
            'Your appointment has been registered. Please check your inbox for details.',
          cancellationPolicy:
            'If you need to reschedule or cancel, please provide at least 24 hours notice.',
          noAvailabilityMessage: 'No appointments available on this date.',
          requiredFieldMessage: 'Please provide this required information.',
        },
        recommendedFields: [
          ...createSystemFields(),
          ...commonCustomerFields,
          {
            id: 'f-notes',
            type: 'long_text',
            label: 'Additional Notes or Requests',
            internalName: 'customer_notes',
            placeholder: 'Anything specific we should know in advance...',
            required: false,
            order: 5,
            stepIndex: 3,
          },
        ],
        highlightedBenefits: [
          'High conversion rate with minimal friction',
          'Clean, modern responsive layout',
          'Includes service and slot verification',
        ],
      };
    }
  }
}
