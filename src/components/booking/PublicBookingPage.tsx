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
  User,
  Check,
  ArrowRight,
  Lock,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 text-center">
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
          isEmbed ? 'p-3 sm:p-4' : 'py-6 px-3 sm:py-12 sm:px-6'
        } flex items-center justify-center transition-colors`}
      >
        <div
          className={`max-w-xl w-full bg-white shadow-xl sm:shadow-2xl border border-slate-200/80 ${getBorderRadius()} overflow-hidden`}
        >
          <div
            className="p-6 sm:p-8 text-center text-white relative overflow-hidden"
            style={{ backgroundColor: branding.colors.primary }}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-inner">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 style={headingStyle} className="text-xl sm:text-2xl font-bold">
              {messaging.successHeadline || 'Booking Confirmed!'}
            </h2>
            <p className="text-white/80 text-xs mt-1 max-w-sm mx-auto">
              Confirmation dispatched to <span className="font-semibold text-white underline">{confirmedAppointment.customerEmail}</span>
            </p>
          </div>

          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* Appointment Snapshot Details */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
                  <p className="text-sm sm:text-base font-bold text-slate-900">{confirmedAppointment.serviceSnapshot.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Price</span>
                  <p className="text-sm sm:text-base font-bold text-emerald-600">
                    {confirmedAppointment.serviceSnapshot.price === 0
                      ? 'Free'
                      : `$${confirmedAppointment.serviceSnapshot.price}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Date & Time</span>
                  <span className="font-semibold text-slate-800 block">{confirmedAppointment.date}</span>
                  <span className="text-slate-500 font-medium">
                    {confirmedAppointment.startTime} - {confirmedAppointment.endTime}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Customer</span>
                  <span className="font-semibold text-slate-800 block truncate">{confirmedAppointment.customerName}</span>
                  <span className="text-slate-500 font-medium truncate block">{confirmedAppointment.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Next Steps / Instructions */}
            {messaging.successInstructions && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Next Steps:</span>
                  <p className="leading-relaxed">{messaging.successInstructions}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedAppointment(null);
                  setSelectedSlot('');
                }}
                className={`w-full sm:flex-1 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:opacity-95 cursor-pointer ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                {cta.confirmationButtonText || 'Book Another Appointment'}
              </button>
              {onExitPreview && (
                <button
                  type="button"
                  onClick={onExitPreview}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
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
        isEmbed ? 'p-2 sm:p-4' : 'py-5 px-3 sm:py-10 sm:px-6'
      } flex flex-col items-center justify-start transition-colors`}
    >
      {/* Top Brand Banner & Heading */}
      <div className="max-w-2xl w-full mb-4 sm:mb-6 text-center px-1">
        {onExitPreview && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-full mb-3 shadow-xs">
            <span>👁️ Live Preview Mode</span>
            <button
              onClick={onExitPreview}
              className="ml-1 text-blue-700 underline font-semibold hover:text-blue-900 cursor-pointer"
            >
              Exit
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-auto h-7 sm:h-8 object-contain rounded-md shadow-xs" />
          ) : (
            <span
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs"
              style={{ backgroundColor: branding.colors.primary }}
            >
              {business.name.charAt(0)}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {business.name}
          </span>
        </div>

        <h1 style={headingStyle} className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {messaging.headline || `Book with ${business.name}`}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
          {messaging.description || 'Select your service, choose an available time slot, and answer a few questions.'}
        </p>

        {/* Multi-step progress bar if applicable */}
        {isMultiStep && (
          <div className="mt-5 max-w-md mx-auto px-2">
            <div className="relative flex items-center justify-between">
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
              <div
                className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 transition-all duration-300 z-0"
                style={{
                  backgroundColor: branding.colors.primary,
                  width: `${(currentStepIndex / (steps.length - 1)) * 88}%`,
                }}
              />

              {steps.map((st, i) => {
                const isActive = currentStepIndex === i;
                const isCompleted = currentStepIndex > i;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i < currentStepIndex) setCurrentStepIndex(i);
                    }}
                    className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'text-white shadow-md ring-4 ring-offset-1'
                        : isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: branding.colors.primary,
                            borderColor: branding.colors.primary,
                            boxShadow: `0 0 0 4px ${branding.colors.primary}25`,
                          }
                        : {}
                    }
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                  </button>
                );
              })}
            </div>

            {/* Mobile Active Step Indicator */}
            <div className="mt-3 flex items-center justify-center">
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Step {currentStepIndex + 1} of {steps.length}: <span style={{ color: branding.colors.primary }}>{steps[currentStepIndex].title}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Booking Card Container */}
      <div
        className={`max-w-2xl w-full bg-white shadow-xl sm:shadow-2xl border border-slate-200/90 ${getBorderRadius()} overflow-hidden p-4 sm:p-8 transition-all`}
      >
        {submitError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* STEP 1 / SECTION 1: Service Selection */}
          {(!isMultiStep || currentStepIndex === 0) && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  1
                </span>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Service
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceSelect(srv.id)}
                      className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/40 ring-2 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: branding.colors.primary,
                              boxShadow: `0 0 0 2px ${branding.colors.primary}25`,
                            }
                          : {}
                      }
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 leading-snug">{srv.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                              {srv.price === 0 ? 'Free' : `$${srv.price}`}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>

                        {srv.description && (
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{srv.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{srv.durationMinutes} minutes duration</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 / SECTION 2: Date & Available Slots Selection */}
          {(!isMultiStep || currentStepIndex === 1) && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: branding.colors.primary }}
                  >
                    2
                  </span>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Choose Date & Time
                  </label>
                </div>

                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {business.timezone}
                </span>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Booking Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                  />
                </div>
              </div>

              {/* Available Slots Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Available Timeslots:
                  </span>
                  {selectedSlot && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Selected: {selectedSlot}
                    </span>
                  )}
                </div>

                {availableSlots.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-700 font-semibold">
                      {messaging.noAvailabilityMessage || 'No available slots on this date.'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Please select another date on the calendar above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => handleSlotSelect(slot.startTime)}
                          className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'text-white shadow-md scale-[1.02]'
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
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                          <span>{slot.startTime}</span>
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
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  3
                </span>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Your Information
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 / SECTION 4: Custom Intake Questions & Conditional Logic */}
          {(!isMultiStep || currentStepIndex === 3) && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: branding.colors.primary }}
                >
                  4
                </span>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Additional Details
                </label>
              </div>

              <div className="space-y-3.5">
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
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.description && (
                          <p className="text-[11px] text-slate-500 leading-normal">{field.description}</p>
                        )}

                        {field.type === 'short_text' && (
                          <input
                            type="text"
                            required={field.required}
                            placeholder={field.placeholder || ''}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                          />
                        )}

                        {field.type === 'long_text' && (
                          <textarea
                            rows={3}
                            required={field.required}
                            placeholder={field.placeholder || ''}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
                          />
                        )}

                        {field.type === 'dropdown' && (
                          <select
                            required={field.required}
                            value={formAnswers[field.id] || ''}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
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
                          <div className="space-y-2 pt-1">
                            {field.options?.map((opt) => (
                              <label key={opt} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt}
                                  checked={formAnswers[field.id] === opt}
                                  onChange={() => handleAnswerChange(field.id, opt)}
                                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === 'consent_checkbox' && (
                          <label className="flex items-start gap-2.5 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              required={field.required}
                              checked={!!formAnswers[field.id]}
                              onChange={(e) => handleAnswerChange(field.id, e.target.checked)}
                              className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer rounded-sm"
                            />
                            <span className="leading-snug">{field.label}</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
              </div>

              {messaging.cancellationPolicy && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">Cancellation Policy:</span>
                  {messaging.cancellationPolicy}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons & Multi-step navigation */}
          <div className="pt-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            {isMultiStep && currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
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
                    setSubmitError('Please select a service first.');
                    return;
                  }
                  if (currentStepIndex === 1 && (!selectedDate || !selectedSlot)) {
                    setSubmitError('Please choose a date and available timeslot.');
                    return;
                  }
                  setSubmitError(null);
                  setCurrentStepIndex((prev) => prev + 1);
                }}
                className={`w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:opacity-95 cursor-pointer flex items-center justify-center gap-2 ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !selectedSlot}
                className={`w-full sm:w-auto px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:opacity-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${getButtonRadius()}`}
                style={{ backgroundColor: branding.colors.primary }}
              >
                <Lock className="w-3.5 h-3.5 opacity-80" />
                <span>{isSubmitting ? 'Securing Slot...' : cta.submitButtonText || 'Confirm Booking'}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Trust & Policy Footer */}
      <div className="mt-6 sm:mt-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-2">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Instant Confirmation
        </span>
        <span className="hidden xs:inline">•</span>
        <span className="font-medium">{business.city}, {business.country}</span>
      </div>
    </div>
  );
};

