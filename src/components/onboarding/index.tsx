import React, { useState } from 'react';
import {
  IndustryCategory,
  BookingModelType,
  TargetAudience,
  CustomerPreferencePriority,
  Service,
  FormField,
  FormConfiguration,
} from '../../types';
import { generateRecommendation, RecommendationResult } from '../../lib/recommendations';
import { db } from '../../lib/db';
import { Button, Input, Textarea, Select } from '../ui';
import {
  Building2,
  Users,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (businessId: string) => void;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 1: Business Basics
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  );
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLink, setSocialLink] = useState('');

  // Step 2: Industry / Niche
  const [industryCategory, setIndustryCategory] = useState<IndustryCategory>('healthcare');
  const [specificNiche, setSpecificNiche] = useState('');

  // Step 3: Target Audience
  const [ageRange, setAgeRange] = useState('25-54');
  const [customerType, setCustomerType] = useState<'B2B' | 'B2C' | 'Both'>('B2C');
  const [scope, setScope] = useState<'local' | 'national' | 'international'>('local');
  const [selectedPriorities, setSelectedPriorities] = useState<CustomerPreferencePriority[]>([
    'Trust',
    'Convenience',
    'Speed',
  ]);
  const [audienceNotes, setAudienceNotes] = useState('');

  // Step 4: Booking Model
  const [bookingModel, setBookingModel] = useState<BookingModelType>('appointment');

  // Step 5: Services (Initial Setup)
  const [initialServices, setInitialServices] = useState<
    Array<{
      name: string;
      description: string;
      durationMinutes: number;
      price: number;
      currency: string;
      bufferBeforeMinutes: number;
      bufferAfterMinutes: number;
    }>
  >([
    {
      name: 'Initial Consultation',
      description: 'Standard 30-minute evaluation and treatment assessment.',
      durationMinutes: 30,
      price: 75,
      currency: 'USD',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 10,
    },
  ]);

  // Step 6: Generated Recommendation & Customization
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [customizedFields, setCustomizedFields] = useState<FormField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormField['type']>('short_text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const prioritiesList: CustomerPreferencePriority[] = [
    'Speed',
    'Convenience',
    'Premium experience',
    'Price',
    'Privacy',
    'Personalization',
    'Trust',
    'Flexibility',
    'Expertise',
  ];

  const handlePriorityToggle = (priority: CustomerPreferencePriority) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority));
    } else {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const handleAddService = () => {
    setInitialServices([
      ...initialServices,
      {
        name: 'Follow-up Session',
        description: 'Review and progress tracking.',
        durationMinutes: 30,
        price: 50,
        currency: 'USD',
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 5,
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    if (initialServices.length <= 1) return;
    setInitialServices(initialServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, key: string, val: any) => {
    const updated = [...initialServices];
    updated[index] = { ...updated[index], [key]: val };
    setInitialServices(updated);
  };

  // Generate recommendation when transitioning to Step 6
  const prepareRecommendation = () => {
    const targetAudience: TargetAudience = {
      ageRange,
      customerType,
      scope,
      priorities: selectedPriorities,
      description: audienceNotes,
    };
    const rec = generateRecommendation(industryCategory, specificNiche, targetAudience, bookingModel, name);
    setRecommendation(rec);
    setCustomizedFields([...rec.recommendedFields]);
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Business name is required.');
        return;
      }
      if (!businessEmail.trim()) {
        setErrorMsg('Contact email is required.');
        return;
      }
    }
    if (step === 5) {
      if (initialServices.length === 0 || !initialServices[0].name.trim()) {
        setErrorMsg('Please specify at least one service with a name.');
        return;
      }
      prepareRecommendation();
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRemoveField = (fieldId: string) => {
    setCustomizedFields(customizedFields.filter((f) => f.id !== fieldId));
  };

  const handleAddNewField = () => {
    if (!newFieldLabel.trim()) return;
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type: newFieldType,
      label: newFieldLabel.trim(),
      internalName: newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      required: false,
      order: customizedFields.length,
      stepIndex: 3,
    };
    setCustomizedFields([...customizedFields, newField]);
    setNewFieldLabel('');
  };

  const handleFinishOnboarding = async () => {
    if (!recommendation) return;
    setIsSubmitting(true);
    try {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // 1. Create Business
      const targetAudience: TargetAudience = {
        ageRange,
        customerType,
        scope,
        priorities: selectedPriorities,
        description: audienceNotes,
      };

      const newBiz = db.createBusiness({
        name: name.trim(),
        slug: generatedSlug || `biz-${Date.now()}`,
        description: description.trim() || `${name} booking and appointments`,
        industryCategory,
        specificNiche: specificNiche.trim() || industryCategory,
        targetAudience,
        bookingModel,
        businessEmail: businessEmail.trim(),
        businessPhone: businessPhone.trim(),
        websiteUrl: websiteUrl.trim(),
        socialLink: socialLink.trim(),
        country,
        city: city.trim() || 'Headquarters',
        timezone,
        onboardingCompleted: true,
      });

      // 2. Create Initial Services
      initialServices.forEach((s, idx) => {
        db.createService({
          businessId: newBiz.id,
          name: s.name,
          description: s.description,
          durationMinutes: Number(s.durationMinutes) || 30,
          price: Number(s.price) || 0,
          currency: s.currency || 'USD',
          bufferBeforeMinutes: Number(s.bufferBeforeMinutes) || 0,
          bufferAfterMinutes: Number(s.bufferAfterMinutes) || 0,
          status: 'active',
          order: idx,
        });
      });

      // 3. Save Form Configuration (Draft & Published)
      const formConfig: FormConfiguration = {
        id: `form_${newBiz.id}`,
        businessId: newBiz.id,
        version: 1,
        status: 'published',
        layout: recommendation.recommendedLayout,
        visualPreset: recommendation.recommendedPreset,
        branding: {
          colors: recommendation.recommendedColors,
          headingFont: recommendation.recommendedHeadingFont,
          bodyFont: recommendation.recommendedBodyFont,
          ui: recommendation.recommendedUI,
        },
        cta: recommendation.recommendedCTA,
        messaging: recommendation.recommendedMessaging,
        fields: customizedFields,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.saveDraftForm(newBiz.id, formConfig);
      db.publishForm(newBiz.id);

      onComplete(newBiz.id);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to complete setup. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Onboarding Header & Progress Indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Guided Business Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Configure Your Branded Booking Engine
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            Understand first. Configure second. Customize third. Publish fourth.
          </p>

          {/* Stepper Dots */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === i
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100'
                      : step > i
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
                </div>
                {i < totalSteps && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-1 rounded ${
                      step > i ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2">
            Step {step} of {totalSteps}:{' '}
            {step === 1 && 'Business Basics'}
            {step === 2 && 'Industry & Niche'}
            {step === 3 && 'Target Audience'}
            {step === 4 && 'Booking Model'}
            {step === 5 && 'Core Services'}
            {step === 6 && 'Smart Recommendations & Preview'}
          </p>
        </div>

        {/* Form Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-10">
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {/* STEP 1: Business Basics */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Tell us about your business</h2>
                  <p className="text-xs text-slate-500">Essential contact details and public identifiers.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Business Name"
                    placeholder="e.g. Apex Physical Therapy or Studio Lumière"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    label="Business Description"
                    placeholder="Provide a concise 1-2 sentence overview of your practice or studio..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="contact@yourbusiness.com"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  required
                />

                <Input
                  label="Business Phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />

                <Input
                  label="City"
                  placeholder="e.g. San Francisco or Chicago"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Input
                  label="Country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Business Timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    helperText="Crucial for calculating open slots accurately."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Industry & Niche */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">What type of business do you run?</h2>
                  <p className="text-xs text-slate-500">
                    This powers our deterministic recommendation engine for tailored booking fields.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'healthcare', label: 'Healthcare & Clinic', icon: '🩺' },
                  { id: 'beauty', label: 'Beauty & Salon', icon: '✨' },
                  { id: 'consulting', label: 'Consulting & B2B', icon: '💼' },
                  { id: 'fitness', label: 'Fitness & Coaching', icon: '🏋️‍♂️' },
                  { id: 'education', label: 'Education & Tutoring', icon: '🎓' },
                  { id: 'home_services', label: 'Home & Repairs', icon: '🔧' },
                  { id: 'real_estate', label: 'Real Estate Tours', icon: '🏡' },
                  { id: 'creative_services', label: 'Creative & Photo', icon: '📸' },
                  { id: 'other', label: 'Other Appointment', icon: '📅' },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setIndustryCategory(ind.id as IndustryCategory)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col items-start transition-all cursor-pointer ${
                      industryCategory === ind.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{ind.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{ind.label}</span>
                  </button>
                ))}
              </div>

              <Input
                label="Specific Specialty or Niche (Optional)"
                placeholder="e.g. Pediatric Orthodontics, Microblading Studio, Executive M&A Advisory"
                value={specificNiche}
                onChange={(e) => setSpecificNiche(e.target.value)}
                helperText="Helps us refine your intake questionnaire nuances."
              />
            </div>
          )}

          {/* STEP 3: Target Audience */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Who are your primary customers?</h2>
                  <p className="text-xs text-slate-500">
                    Understand what drives your clients so we can optimize form length and UX tone.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Customer Type"
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as any)}
                >
                  <option value="B2C">B2C (Consumers / Individuals)</option>
                  <option value="B2B">B2B (Companies / Executives)</option>
                  <option value="Both">Both B2B and B2C</option>
                </Select>

                <Select
                  label="Geographic Scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value as any)}
                >
                  <option value="local">Local Community / Walk-in</option>
                  <option value="national">National</option>
                  <option value="international">Global / Virtual</option>
                </Select>

                <Input
                  label="Target Age Range"
                  placeholder="e.g. 25-45"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  What matters most to your customers? (Select multiple)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {prioritiesList.map((priority) => {
                    const isSelected = selectedPriorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => handlePriorityToggle(priority)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {priority}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-1 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                label="Any specific customer requirements or expectations? (Optional)"
                placeholder="e.g. Clients value discretion, need reminders via SMS, or have specific pre-visit requirements."
                value={audienceNotes}
                onChange={(e) => setAudienceNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* STEP 4: Booking Model */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">What is your booking model?</h2>
                  <p className="text-xs text-slate-500">
                    Defines how slots, confirmations, and scheduling durations behave.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'appointment',
                    title: 'Appointment Booking',
                    desc: 'Fixed 1-on-1 clinic or professional visits (e.g. Doctor, Dentist, Chiropractor).',
                  },
                  {
                    id: 'service_booking',
                    title: 'Service Booking',
                    desc: 'Treatment or styling with variable durations and specialist choice (e.g. Haircut, Spa).',
                  },
                  {
                    id: 'consultation',
                    title: 'Consultation / Advisory',
                    desc: 'High-value strategy or legal intake with qualification questions.',
                  },
                  {
                    id: 'meeting',
                    title: 'Discovery Meeting',
                    desc: 'Quick 20-30 min intro calls with calendar invites and video conferencing.',
                  },
                  {
                    id: 'event_session',
                    title: 'Training / Class Session',
                    desc: 'Group or 1-on-1 physical coaching (e.g. Personal Trainer, Yoga, Tutor).',
                  },
                  {
                    id: 'custom',
                    title: 'Custom Booking Flow',
                    desc: 'General purpose time-slot reservation tailored to your specific workflow.',
                  },
                ].map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setBookingModel(model.id as BookingModelType)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      bookingModel === model.id
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{model.title}</span>
                      {bookingModel === model.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{model.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Core Services Setup */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Define your initial services</h2>
                    <p className="text-xs text-slate-500">
                      Add at least one service so customers can select what they need.
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddService}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Service
                </Button>
              </div>

              <div className="space-y-4">
                {initialServices.map((svc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Service #{idx + 1}
                      </span>
                      {initialServices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Service Name"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                        placeholder="e.g. General Consultation"
                        required
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Duration (min)"
                          type="number"
                          value={svc.durationMinutes}
                          onChange={(e) => handleServiceChange(idx, 'durationMinutes', e.target.value)}
                        />
                        <Input
                          label="Price ($)"
                          type="number"
                          value={svc.price}
                          onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Description"
                          value={svc.description}
                          onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                          placeholder="Short summary of what is included..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Smart Recommendations & Transparency */}
          {step === 6 && recommendation && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Recommendation Engine Output: {recommendation.industryTitle}
                </div>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  Based on your business type (<span className="font-semibold">{name}</span>), audience profile, and{' '}
                  <span className="font-semibold">{bookingModel}</span> model, we designed a recommended experience.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recommendation.highlightedBenefits.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-white px-2.5 py-0.5 rounded-full text-blue-700 border border-blue-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Attributes Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Layout
                  </span>
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {recommendation.recommendedLayout.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Preset
                  </span>
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {recommendation.recommendedPreset}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Typography
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {recommendation.recommendedHeadingFont}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Brand Color
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: recommendation.recommendedColors.primary }}
                    />
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {recommendation.recommendedColors.primary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields Review & Customization */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Recommended Form Intake Fields ({customizedFields.length})
                  </label>
                  <span className="text-[11px] text-slate-500">You can customize, add, or remove fields</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {customizedFields.map((f, idx) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs hover:border-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-800">{f.label}</span>
                          <span className="ml-2 text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded">
                            {f.type.replace('_', ' ')}
                          </span>
                          {f.required && (
                            <span className="ml-1 text-[10px] text-red-500 font-semibold">Required</span>
                          )}
                        </div>
                      </div>

                      {!f.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(f.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Quick Field */}
                <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <input
                    type="text"
                    placeholder="Add custom question (e.g. Medical Allergies)..."
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <Button size="sm" variant="secondary" onClick={handleAddNewField}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={handleBack} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : onCancel ? (
              <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button size="md" onClick={handleNext}>
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="md"
                variant="primary"
                onClick={handleFinishOnboarding}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete Setup & Open Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
