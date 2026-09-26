import React, { useState, useEffect } from 'react';
import {
  Business,
  Service,
  FormConfiguration,
  FormField,
  Appointment,
} from '../../types';
import { db } from '../../lib/db';
import { getAvailableSlots, TimeSlot } from '../../lib/availability';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface PublicBookingPageProps {
  businessSlug: string;
  isEmbed?: boolean;
  onExitPreview?: () => void;
}

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({
  businessSlug,
  isEmbed = false,
  onExitPreview,
}) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<FormConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});

  // Multi-step pagination
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load business & configuration
  useEffect(() => {
    const biz = db.getBusinessBySlug(businessSlug);
    if (!biz) {
      setError(`Business "${businessSlug}" not found or inactive.`);
      setLoading(false);
      return;
    }

    setBusiness(biz);
    const activeServices = db.getServices(biz.id).filter((s) => s.status === 'active');
    setServices(activeServices);
    if (activeServices.length > 0) {
      setSelectedServiceId(activeServices[0].id);
    }

    // Load published form (or draft if no published version yet)
    const published = db.getPublishedForm(biz.id) || db.getDraftForm(biz.id);
    setConfig(published);

    // Default to tomorrow's date for initial slot convenience
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);

    // Record Funnel Page View
    db.recordAnalyticsEvent(biz.id, 'page_view');

    setLoading(false);
  }, [businessSlug]);

  // Recalculate available slots whenever date, service, or business changes
  useEffect(() => {
    if (!business || !selectedServiceId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const service = services.find((s) => s.id === selectedServiceId);
    if (!service) return;

    const availability = db.getAvailability(business.id);
    const existing = db.getAppointments(business.id);
    const slots = getAvailableSlots(availability, service, selectedDate, existing);
    setAvailableSlots(slots);
    setSelectedSlot('');
  }, [business, selectedServiceId, selectedDate, services]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (business) {
      db.recordAnalyticsEvent(business.id, 'service_selected', serviceId);
    }
  };

  const handleSlotSelect = (slotStartTime: string) => {
    setSelectedSlot(slotStartTime);
    if (business) {
      db.recordAnalyticsEvent(business.id, 'slot_selected', selectedServiceId);
    }
  };

  const handleAnswerChange = (fieldId: string, val: any) => {
    setFormAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!business || !config) return;

    setSubmitError(null);

    // Validations
    if (!selectedServiceId) {
      setSubmitError('Please select a service.');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      setSubmitError('Please choose an available date and timeslot.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      setSubmitError('Full name and email address are required.');
      return;
    }

    // Required fields validation
    const missingFields = config.fields.filter(
      (f) => f.required && !f.isSystem && (formAnswers[f.id] === undefined || formAnswers[f.id] === '')
    );
    if (missingFields.length > 0) {
      setSubmitError(`Please fill in required question: ${missingFields[0].label}`);
      return;
    }

    setIsSubmitting(true);
    db.recordAnalyticsEvent(business.id, 'booking_submitted', selectedServiceId);

    try {
      const result = db.createBooking({
        businessId: business.id,
        serviceId: selectedServiceId,
        date: selectedDate,
        startTime: selectedSlot,
        customerName,
        customerEmail,
        customerPhone: customerPhone || 'Not provided',
        answers: formAnswers,
      });

      if (!result.success) {
        setSubmitError(result.error || 'Failed to confirm booking.');
        setIsSubmitting(false);
        return;
      }

      setConfirmedAppointment(result.appointment || null);
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected booking error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading booking experience...</p>
        </div>
      </div>
    );
  }

  if (error || !business || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Booking Experience Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'This booking page has not yet been published.'}</p>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const { branding, cta, messaging, layout, fields } = config;
  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Dynamic CSS variables for branding
  const brandStyle = {
    '--brand-primary': branding.colors.primary,
    '--brand-secondary': branding.colors.secondary,
    '--brand-accent': branding.colors.accent,
    '--brand-bg': branding.colors.background,
    '--brand-surface': branding.colors.surface,
    '--brand-text': branding.colors.text,
    '--brand-muted': branding.colors.mutedText,
    fontFamily: `"${branding.bodyFont}", sans-serif`,
  } as React.CSSProperties;

  const headingStyle = {
    fontFamily: `"${branding.headingFont}", sans-serif`,
  };

  const getBorderRadius = () => {
    switch (branding.ui.borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-lg';
      case 'lg': return 'rounded-2xl';
      case 'full': return 'rounded-3xl';
      default: return 'rounded-xl';
    }
  };

  const getButtonRadius = () => {
    switch (branding.ui.buttonRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-md';
      case 'lg': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-lg';
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (confirmedAppointment) {
    return (
      <div
        style={brandStyle}
        className={`min-h-screen ${
          isEmbed ? 'p-4' : 'py-12 px-4 sm:px-6'
        } flex items-center justify-center transition-colors`}
      >
        <div
          className={`max-w-xl w-full bg-white shadow-xl border border-slate-200/80 ${getBorderRadius()} overflow-hidden`}
        >
          <div
            className="p-8 text-center text-white relative overflow-hidden"
            style={{ backgroundColor: branding.colors.primary }}
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 style={headingStyle} className="text-2xl font-bold">
              {messaging.successHeadline || 'Booking Confirmed!'}
            </h2>
            <p className="text-white/80 text-xs mt-1 max-w-sm mx-auto">
              Confirmation and calendar invite dispatched to {confirmedAppointment.customerEmail}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Appointment Snapshot Details */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</span>
                  <p className="text-sm font-bold text-slate-900">{confirmedAppointment.serviceSnapshot.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</span>
                  <p className="text-sm font-bold text-slate-900">
                    {confirmedAppointment.serviceSnapshot.price === 0
                      ? 'Free'
                      : `$${confirmedAppointment.serviceSnapshot.price}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Date</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Time</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedAppointment.startTime} - {confirmedAppointment.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Customer</span>
                  <span className="font-semibold text-slate-800">{confirmedAppointment.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timezone</span>
                  <span className="font-semibold text-slate-800">{business.timezone}</span>
                </div>
              </div>
            </div>

            {/* Next Steps / Instructions */}
            {messaging.successInstructions && (
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900">
                <span className="font-bold block mb-1">What to expect next:</span>
                <p>{messaging.successInstructions}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedAppointment(null);
                  setSelectedSlot('');
                }}
                className={`flex-1 py-2.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-95 ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                {cta.confirmationButtonText || 'Book Another Appointment'}
              </button>
              {onExitPreview && (
                <button
                  type="button"
                  onClick={onExitPreview}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Exit Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps definition for multi-step mode
  const isMultiStep = layout === 'multi_step';
  const steps = [
    { title: 'Service', desc: 'Choose service' },
    { title: 'Date & Time', desc: 'Select slot' },
    { title: 'Your Details', desc: 'Contact info' },
    { title: 'Questions', desc: 'Additional notes' },
  ];

  return (
    <div
      style={brandStyle}
      className={`min-h-screen ${
        isEmbed ? 'p-2 sm:p-4' : 'py-8 px-4 sm:px-6'
      } flex flex-col items-center justify-start transition-colors`}
    >
      {/* Top Brand Banner & Heading */}
      <div className="max-w-2xl w-full mb-6 text-center">
        {onExitPreview && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-full mb-4">
            <span>👁️ Live Customer Preview Mode</span>
            <button
              onClick={onExitPreview}
              className="ml-2 text-blue-700 underline font-semibold hover:text-blue-900"
            >
              Exit to Builder
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-auto h-8 object-contain rounded-md shadow-xs" />
          ) : (
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: branding.colors.primary }}
            >
              {business.name.charAt(0)}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {business.name}
          </span>
        </div>

        <h1 style={headingStyle} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {messaging.headline || `Book with ${business.name}`}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          {messaging.description || 'Select your service, choose an available time slot, and answer a few questions.'}
        </p>

        {/* Multi-step progress bar if applicable */}
        {isMultiStep && (
          <div className="mt-6 max-w-md mx-auto flex items-center justify-between px-2">
            {steps.map((st, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStepIndex === i
                      ? 'text-white shadow-sm ring-2 ring-offset-1'
                      : currentStepIndex > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                  style={
                    currentStepIndex === i
                      ? { backgroundColor: branding.colors.primary, boxShadow: `0 0 0 2px ${branding.colors.primary}` }
                      : {}
                  }
                >
                  {currentStepIndex > i ? '✓' : i + 1}
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1">{st.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Booking Card Container */}
      <div
        className={`max-w-2xl w-full bg-white shadow-xl border border-slate-200/90 ${getBorderRadius()} overflow-hidden p-6 sm:p-8`}
      >
        {submitError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* STEP 1 / SECTION 1: Service Selection */}
          {(!isMultiStep || currentStepIndex === 0) && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Select Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceSelect(srv.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: branding.colors.primary,
                              boxShadow: `0 0 0 2px ${branding.colors.primary}20`,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-bold text-slate-900">{srv.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {srv.price === 0 ? 'Free' : `$${srv.price}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{srv.durationMinutes} mins</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 / SECTION 2: Date & Available Slots Selection */}
          {(!isMultiStep || currentStepIndex === 1) && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Choose Date & Time ({business.timezone})
                </label>
                {selectedService && (
                  <span className="text-xs font-medium text-slate-500">
                    Duration: {selectedService.durationMinutes}m
                  </span>
                )}
              </div>

              {/* Date Input */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Available Slots Grid */}
              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">
                  Available Slots for {selectedDate || 'Selected Date'}:
                </span>

                {availableSlots.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-600 font-medium">
                      {messaging.noAvailabilityMessage || 'No available slots on this date.'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Please pick another weekday or contact us directly.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => handleSlotSelect(slot.startTime)}
                          className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'text-white shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: branding.colors.primary,
                                  borderColor: branding.colors.primary,
                                }
                              : {}
                          }
                        >
                          {slot.startTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 / SECTION 3: Customer Information */}
          {(!isMultiStep || currentStepIndex === 2) && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Your Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 / SECTION 4: Custom Intake Questions & Conditional Logic */}
          {(!isMultiStep || currentStepIndex === 3) && (
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isMultiStep ? '4. Additional Details' : '4. Additional Details'}
              </label>

              <div className="space-y-3">
                {fields
                  .filter((f) => !f.isSystem && f.id !== 'f-name' && f.id !== 'f-email' && f.id !== 'f-phone')
                  .map((field) => {
                    // Check conditional rules
                    if (field.visibilityRules && field.visibilityRules.length > 0) {
                      for (const rule of field.visibilityRules) {
                        const currentVal = formAnswers[rule.targetFieldId];
                        if (rule.operator === 'equals' && currentVal !== rule.value) {
                          return null;
                        }
                      }
                    }

                    return (
                      <div key={field.id} className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-[11px] text-slate-500">{field.description}</p>
                        )}

                        {field.type === 'short_text' && (
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder || ''}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {field.type === 'long_text' && (
                          <textarea
                            rows={3}
                            required={field.required}
                            placeholder={field.placeholder || ''}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {field.type === 'dropdown' && (
                          <select
                            required={field.required}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select an option...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'radio' && (
                          <div className="space-y-1.5 pt-1">
                            {field.options?.map((opt) => (
                              <label key={opt} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt}
                                  checked={formAnswers[field.id] === opt}
                                  onChange={() => handleAnswerChange(field.id, opt)}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'consent_checkbox' && (
                          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              required={field.required}
                              checked={!!formAnswers[field.id]}
                              onChange={(e) => handleAnswerChange(field.id, e.target.checked)}
                              className="mt-0.5 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{field.label}</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
              </div>

              {messaging.cancellationPolicy && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 block">Cancellation Policy:</span>
                  {messaging.cancellationPolicy}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons & Multi-step navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {isMultiStep && currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {cta.backButtonText || 'Previous Step'}
              </button>
            ) : (
              <div />
            )}

            {isMultiStep && currentStepIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStepIndex === 0 && !selectedServiceId) {
                    setSubmitError('Please pick a service first.');
                    return;
                  }
                  if (currentStepIndex === 1 && (!selectedDate || !selectedSlot)) {
                    setSubmitError('Please select a date and timeslot.');
                    return;
                  }
                  setSubmitError(null);
                  setCurrentStepIndex((prev) => prev + 1);
                }}
                className={`px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-95 ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !selectedSlot}
                className={`w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50 ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                {isSubmitting ? 'Securing Slot...' : cta.submitButtonText || 'Confirm Booking'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Trust & Policy Footer */}
      <div className="mt-8 text-center text-xs text-slate-600 flex items-center justify-center gap-4">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Instant Confirmation
        </span>
        <span>•</span>
        <span>{business.city}, {business.country}</span>
      </div>
    </div>
  );
};
