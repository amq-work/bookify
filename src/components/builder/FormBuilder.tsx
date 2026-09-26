import React, { useState, useEffect, useRef } from 'react';
import {
  Business,
  FormConfiguration,
  FormField,
  FormVisualPreset,
  FontFamilyChoice,
  BrandColors,
} from '../../types';
import { db } from '../../lib/db';
import { Button, Input, Textarea, Select } from '../ui';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  Check,
  Globe,
  Sparkles,
  Save,
  Clock,
  ArrowUp,
  ArrowDown,
  Layers,
  Settings,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface FormBuilderProps {
  business: Business;
  onPreviewPublic: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ business, onPreviewPublic }) => {
  const [config, setConfig] = useState<FormConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'branding' | 'styling' | 'content'>('fields');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [publishMessage, setPublishMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const autosaveTimerRef = useRef<any>(null);

  // Load draft configuration (or published if no draft)
  useEffect(() => {
    const existing = db.getDraftForm(business.id) || db.getPublishedForm(business.id);
    if (existing) {
      setConfig(JSON.parse(JSON.stringify(existing)));
    }
  }, [business.id]);

  // Autosave when config changes
  const triggerAutosave = (newConfig: FormConfiguration) => {
    setSaveStatus('unsaved');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      db.saveDraftForm(business.id, newConfig);
      setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    }, 1000);
  };

  const updateConfig = (updater: (prev: FormConfiguration) => FormConfiguration) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      triggerAutosave(updated);
      return updated;
    });
  };

  const handlePublish = async () => {
    if (!config) return;
    setIsPublishing(true);
    setPublishMessage(null);

    // Save draft first
    db.saveDraftForm(business.id, config);

    // Publish
    const result = db.publishForm(business.id);
    if (result.success) {
      setPublishMessage({
        type: 'success',
        text: 'Published! Your live booking experience is now running this configuration.',
      });
      setConfig((prev) => (prev ? { ...prev, status: 'published', version: prev.version + 1 } : null));
    } else {
      setPublishMessage({
        type: 'error',
        text: result.error || 'Failed to publish form.',
      });
    }
    setIsPublishing(false);
  };

  if (!config) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading Form Builder...
      </div>
    );
  }

  // Predefined palettes
  const colorPresets: Array<{ name: string; colors: BrandColors }> = [
    {
      name: 'Executive Slate',
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
    },
    {
      name: 'Clinical Sky',
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
    },
    {
      name: 'Luxury Rose',
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
    },
    {
      name: 'Forest Emerald',
      colors: {
        primary: '#15803d',
        secondary: '#166534',
        accent: '#22c55e',
        background: '#f0fdf4',
        surface: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        error: '#ef4444',
        success: '#10b981',
      },
    },
    {
      name: 'Athletic Amber',
      colors: {
        primary: '#ea580c',
        secondary: '#c2410c',
        accent: '#f97316',
        background: '#fff7ed',
        surface: '#ffffff',
        text: '#1c1917',
        mutedText: '#78716c',
        error: '#ef4444',
        success: '#16a34a',
      },
    },
  ];

  const fontsList: FontFamilyChoice[] = [
    'Inter',
    'Plus Jakarta Sans',
    'DM Sans',
    'Poppins',
    'Manrope',
  ];

  const presetsList: FormVisualPreset[] = [
    'minimal',
    'modern',
    'soft',
    'professional',
    'premium',
    'compact',
  ];

  const handleAddField = () => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type: 'short_text',
      label: 'New Question',
      internalName: `custom_${Date.now()}`,
      required: false,
      placeholder: 'Enter answer here...',
      order: config.fields.length,
      stepIndex: 3,
    };
    updateConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newField.id);
  };

  const handleRemoveField = (fieldId: string) => {
    updateConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.fields.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...config.fields];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    updateConfig((prev) => ({ ...prev, fields: reordered }));
  };

  const selectedField = config.fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-transparent overflow-hidden">
      {/* Top Action Bar */}
      <div className="h-14 bg-white/40 backdrop-blur-md border-b border-white/60 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#274c77] text-sm">{business.name}</span>
            <span className="text-[#6096ba]">/</span>
            <span className="text-xs text-[#8b8c89] font-medium">Form Builder (v{config.version})</span>
          </div>

          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
              config.status === 'published'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {config.status}
          </span>

          {/* Autosave Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 pl-2">
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-slate-500">Draft saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-500">Saving...</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-[11px] text-amber-600 font-medium">Unsaved changes</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onPreviewPublic}>
            <Eye className="w-3.5 h-3.5 mr-1" /> View Live Page
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handlePublish}
            isLoading={isPublishing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Globe className="w-3.5 h-3.5 mr-1" /> Publish Changes
          </Button>
        </div>
      </div>

      {publishMessage && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between ${
            publishMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}
        >
          <span>{publishMessage.text}</span>
          <button onClick={() => setPublishMessage(null)} className="font-bold underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Layout (Three-Column / Responsive Stack) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT COLUMN: Controls & Tabs */}
        <div className="w-full lg:w-80 glass-panel border-b lg:border-b-0 lg:border-r border-white/60 flex flex-col shrink-0 rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl overflow-hidden shadow-xl">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-white/60 p-1.5 gap-1 bg-white/30 backdrop-blur-sm">
            {[
              { id: 'fields', label: 'Fields', icon: Layers },
              { id: 'branding', label: 'Brand', icon: Palette },
              { id: 'styling', label: 'Layout', icon: Sliders },
              { id: 'content', label: 'Copy', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#274c77] text-white shadow-md'
                      : 'text-[#274c77] hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: FORM FIELDS */}
            {activeTab === 'fields' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#274c77] uppercase tracking-wider">
                    Form Questions ({config.fields.length})
                  </span>
                  <Button size="sm" variant="outline" onClick={handleAddField}>
                    <Plus className="w-3 h-3 mr-1" /> Add Field
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {config.fields.map((f, idx) => {
                    const isSelected = selectedFieldId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[#6096ba] bg-white/70 shadow-sm ring-1 ring-[#6096ba]'
                            : 'border-white/50 bg-white/40 hover:border-white/80 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-mono text-slate-400 w-4">{idx + 1}</span>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 block truncate">{f.label}</span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {f.type.replace('_', ' ')} {f.required && '• Required'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(idx, 'up');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveField(idx, 'down');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          {!f.isSystem && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveField(f.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded ml-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Field Details Inspector when field is selected */}
                {selectedField && (
                  <div className="mt-4 p-3.5 bg-white/40 border border-white/60 rounded-xl space-y-3 backdrop-blur-md shadow-inner animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-slate-800 block pb-1 border-b border-slate-200">
                      Edit Question: {selectedField.label}
                    </span>

                    <Input
                      label="Field Label"
                      value={selectedField.label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          fields: prev.fields.map((f) =>
                            f.id === selectedField.id ? { ...f, label: e.target.value } : f
                          ),
                        }))
                      }
                    />

                    <Select
                      label="Input Type"
                      value={selectedField.type}
                      disabled={selectedField.isSystem}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          fields: prev.fields.map((f) =>
                            f.id === selectedField.id ? { ...f, type: e.target.value as any } : f
                          ),
                        }))
                      }
                    >
                      <option value="short_text">Short Text</option>
                      <option value="long_text">Long Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Single Checkbox</option>
                      <option value="address">Street Address</option>
                      <option value="consent_checkbox">Consent / Waiver</option>
                    </Select>

                    <Input
                      label="Placeholder Text"
                      value={selectedField.placeholder || ''}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          fields: prev.fields.map((f) =>
                            f.id === selectedField.id ? { ...f, placeholder: e.target.value } : f
                          ),
                        }))
                      }
                    />

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        disabled={selectedField.isSystem}
                        onChange={(e) =>
                          updateConfig((prev) => ({
                            ...prev,
                            fields: prev.fields.map((f) =>
                              f.id === selectedField.id ? { ...f, required: e.target.checked } : f
                            ),
                          }))
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mark as mandatory / required</span>
                    </label>

                    {(selectedField.type === 'dropdown' || selectedField.type === 'radio') && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-semibold text-slate-600 block">
                          Options (Comma Separated)
                        </label>
                        <input
                          type="text"
                          value={selectedField.options?.join(', ') || ''}
                          onChange={(e) => {
                            const opts = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            updateConfig((prev) => ({
                              ...prev,
                              fields: prev.fields.map((f) =>
                                f.id === selectedField.id ? { ...f, options: opts } : f
                              ),
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BRANDING (CENTRALIZED) */}
            {activeTab === 'branding' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                <div className="p-4 bg-white/60 border border-emerald-300 rounded-2xl space-y-2 shadow-sm backdrop-blur-md">
                  <span className="font-bold text-xs text-[#0d4722] flex items-center gap-1.5 font-heading">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Centralized Business Branding
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Per design requirements, colors and logos are configured centrally in <strong>Workspace Settings &rarr; Branding</strong> so all customer forms remain cohesive and unified.
                  </p>
                </div>

                <div className="p-4 bg-white/40 border border-white/60 rounded-2xl space-y-3 backdrop-blur-md shadow-inner">
                  <span className="text-xs font-bold text-[#274c77] uppercase tracking-wider block font-heading">
                    Active Master Brand Identity
                  </span>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Primary Color</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: config.branding.colors.primary }}
                      />
                      <span>{config.branding.colors.primary}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Accent Color</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: config.branding.colors.accent }}
                      />
                      <span>{config.branding.colors.accent}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Global Headings Font</span>
                    <span className="font-bold text-slate-800">Oregon</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-500">Global Body Font</span>
                    <span className="font-bold text-slate-800">Plus Jakarta Sans</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  To update logo or colors, switch to Workspace Settings &rarr; Branding.
                </p>
              </div>
            )}

            {/* TAB 3: STYLING & UI CONFIG */}
            {activeTab === 'styling' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                <Select
                  label="Form Flow Structure"
                  value={config.layout}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      layout: e.target.value as any,
                    }))
                  }
                  helperText="Single-page is fast & compact; multi-step is organized into sequential steps."
                >
                  <option value="single_page">Single-Page Flow</option>
                  <option value="multi_step">Multi-Step Card Flow</option>
                </Select>

                <Select
                  label="Visual Preset Theme"
                  value={config.visualPreset}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      visualPreset: e.target.value as any,
                    }))
                  }
                >
                  {presetsList.map((p) => (
                    <option key={p} value={p} className="capitalize">
                      {p}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Corner Border Radius"
                  value={config.branding.ui.borderRadius}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        ui: { ...prev.branding.ui, borderRadius: e.target.value as any },
                      },
                    }))
                  }
                >
                  <option value="none">Square (None)</option>
                  <option value="sm">Subtle (Small)</option>
                  <option value="md">Balanced (Medium)</option>
                  <option value="lg">Rounded (Large)</option>
                  <option value="full">Pill / Soft (Full)</option>
                </Select>

                <Select
                  label="Button Radius"
                  value={config.branding.ui.buttonRadius}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        ui: { ...prev.branding.ui, buttonRadius: e.target.value as any },
                      },
                    }))
                  }
                >
                  <option value="none">Square</option>
                  <option value="sm">Small Radius</option>
                  <option value="md">Medium Radius</option>
                  <option value="full">Full Rounded Pill</option>
                </Select>

                <Select
                  label="Form Width"
                  value={config.branding.ui.formWidth}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        ui: { ...prev.branding.ui, formWidth: e.target.value as any },
                      },
                    }))
                  }
                >
                  <option value="narrow">Narrow (Centered Mobile Feel)</option>
                  <option value="medium">Standard (Balanced)</option>
                  <option value="wide">Wide (Desktop Focus)</option>
                </Select>
              </div>
            )}

            {/* TAB 4: COPY & MESSAGING */}
            {activeTab === 'content' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                <Input
                  label="Form Headline"
                  value={config.messaging.headline}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      messaging: { ...prev.messaging, headline: e.target.value },
                    }))
                  }
                />

                <Textarea
                  label="Form Description"
                  rows={2}
                  value={config.messaging.description}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      messaging: { ...prev.messaging, description: e.target.value },
                    }))
                  }
                />

                <Input
                  label="Submit Button Text"
                  value={config.cta.submitButtonText}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      cta: { ...prev.cta, submitButtonText: e.target.value },
                    }))
                  }
                />

                <Input
                  label="Success Headline"
                  value={config.messaging.successHeadline}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      messaging: { ...prev.messaging, successHeadline: e.target.value },
                    }))
                  }
                />

                <Textarea
                  label="Confirmation Instructions"
                  rows={2}
                  value={config.messaging.successInstructions}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      messaging: { ...prev.messaging, successInstructions: e.target.value },
                    }))
                  }
                />

                <Textarea
                  label="Cancellation Policy"
                  rows={2}
                  value={config.messaging.cancellationPolicy}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      messaging: { ...prev.messaging, cancellationPolicy: e.target.value },
                    }))
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Real-Time Interactive Live Preview */}
        <div className="flex-1 bg-transparent p-4 sm:p-6 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl mb-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#274c77]" />
              Live Canvas Preview (Updates dynamically as you edit)
            </span>
            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">
              {config.layout} • {config.branding.headingFont}
            </span>
          </div>

          {/* Form Canvas Render */}
          <div
            className="w-full max-w-2xl glass-card shadow-2xl border border-white/70 rounded-3xl overflow-hidden transition-all p-6 sm:p-8 relative"
            style={{
              fontFamily: `"${config.branding.bodyFont}", sans-serif`,
            }}
          >
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#a3cef1]/30 rounded-full blur-3xl pointer-events-none" />
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 mb-2">
                {config.branding.logoUrl ? (
                  <img src={config.branding.logoUrl} alt="Logo" className="w-auto h-6 object-contain rounded-sm" />
                ) : (
                  <span
                    className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: config.branding.colors.primary }}
                  >
                    {business.name.charAt(0)}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {business.name}
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: `"${config.branding.headingFont}", sans-serif` }}
              >
                {config.messaging.headline}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {config.messaging.description}
              </p>
            </div>

            {/* Simulated Live Form Fields */}
            <div className="space-y-4">
              {config.fields.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelectedFieldId(f.id);
                    setActiveTab('fields');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-white/40 backdrop-blur-sm relative z-10 ${
                    selectedFieldId === f.id
                      ? 'border-[#274c77] shadow-md ring-1 ring-[#274c77] scale-[1.02]'
                      : 'border-white/60 hover:border-[#6096ba]/50 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <span className="text-[10px] text-slate-400">{f.type.replace('_', ' ')}</span>
                  </div>

                  {f.type === 'service_selector' && (
                    <div className="p-3 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800">1. Service Selector (System)</span>
                      <span className="text-slate-400 text-[11px]">Dynamic from your services</span>
                    </div>
                  )}

                  {f.type === 'datetime_selector' && (
                    <div className="p-3 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800">2. Real-Time Slot Calendar (System)</span>
                      <span className="text-slate-400 text-[11px]">Computes open slots & buffers</span>
                    </div>
                  )}

                  {f.type === 'short_text' && (
                    <div className="px-3 py-2 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs text-[#8b8c89]">
                      {f.placeholder || 'Text input preview...'}
                    </div>
                  )}

                  {f.type === 'email' && (
                    <div className="px-3 py-2 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs text-[#8b8c89]">
                      customer@example.com
                    </div>
                  )}

                  {f.type === 'dropdown' && (
                    <div className="px-3 py-2 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs text-[#8b8c89] flex items-center justify-between">
                      <span>Select an option...</span>
                      <span>▼</span>
                    </div>
                  )}

                  {f.type === 'radio' && (
                    <div className="space-y-1 pt-1 text-xs text-slate-600">
                      {f.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" disabled checked={i === 0} />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {f.type === 'long_text' && (
                    <div className="px-3 py-3 bg-white/50 border border-white/60 shadow-inner rounded-xl text-xs text-[#8b8c89]">
                      {f.placeholder || 'Long response area...'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button Preview */}
            <div className="mt-6 pt-4 border-t border-white/40 flex justify-end relative z-10">
              <button
                type="button"
                className="px-6 py-2.5 text-xs font-bold text-white shadow-lg rounded-xl hover:-translate-y-0.5 transition-transform"
                style={{ backgroundColor: config.branding.colors.primary }}
              >
                {config.cta.submitButtonText || 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
