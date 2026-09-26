import React, { useState, useEffect } from 'react';
import { db } from './lib/db';
import { Business, Appointment, Service } from './types';
import { OnboardingFlow } from './components/onboarding';
import { FormBuilder } from './components/builder/FormBuilder';
import { PublicBookingPage } from './components/booking/PublicBookingPage';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { BookingsTab } from './components/dashboard/BookingsTab';
import { CustomersTab } from './components/dashboard/CustomersTab';
import { ServicesTab } from './components/dashboard/ServicesTab';
import { AvailabilityTab } from './components/dashboard/AvailabilityTab';
import { AnalyticsTab } from './components/dashboard/AnalyticsTab';
import { IntegrationsTab } from './components/dashboard/IntegrationsTab';
import { SettingsTab } from './components/dashboard/SettingsTab';
import { BrandingTab } from './components/dashboard/BrandingTab';
import { ProductStrategyModal } from './components/docs/ProductStrategyModal';
import {
  LayoutGrid,
  Calendar,
  Users,
  Scissors,
  Clock,
  FileText,
  BarChart3,
  PenTool,
  Puzzle,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Plus,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';

export default function App() {
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [previewPublicSlug, setPreviewPublicSlug] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data cache
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Listen to hash routes (e.g. #book/arc-company)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#book/')) {
        const slug = hash.replace('#book/', '').split('?')[0];
        setPreviewPublicSlug(slug);
      } else {
        setPreviewPublicSlug(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const refreshData = () => {
    const bizList = db.getBusinessesForCurrentUser();
    setBusinesses(bizList);

    const currentBiz = db.getActiveBusiness();
    setActiveBusiness(currentBiz);

    if (currentBiz) {
      setAppointments(db.getAppointments(currentBiz.id));
      setServices(db.getServices(currentBiz.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSelectBusiness = (bizId: string) => {
    db.setActiveBusiness(bizId);
    setIsBusinessDropdownOpen(false);
    refreshData();
  };

  const handleStartOnboarding = () => {
    setIsBusinessDropdownOpen(false);
    setIsOnboarding(true);
  };

  const handleOnboardingComplete = (newBusinessId: string) => {
    setIsOnboarding(false);
    db.setActiveBusiness(newBusinessId);
    refreshData();
    setActiveTab('overview');
  };

  // If viewing public booking page via hash route or preview
  if (previewPublicSlug) {
    return (
      <PublicBookingPage
        businessSlug={previewPublicSlug}
        onExitPreview={() => {
          window.location.hash = '';
          setPreviewPublicSlug(null);
        }}
      />
    );
  }

  // If running through multi-step onboarding
  if (isOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onCancel={businesses.length > 0 ? () => setIsOnboarding(false) : undefined}
      />
    );
  }

  if (!activeBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7ecef] to-[#a3cef1]/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-64 h-64 bg-[#a3cef1] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/50 text-[#274c77] rounded-full flex items-center justify-center mx-auto shadow-sm border border-white/60">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-[#274c77] font-heading">Welcome to Bookify</h2>
            <p className="text-xs text-[#6096ba]">
              Launch your branded booking engine with custom services, forms, and availability.
            </p>
            <button
              onClick={handleStartOnboarding}
              className="w-full py-2.5 bg-[#274c77] hover:bg-[#1a3454] text-white text-xs font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-[#274c77]/30 hover:translate-y-[-1px]"
            >
              Start Guided Onboarding <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#e7ecef] antialiased text-[#274c77] font-sans flex flex-col justify-center overflow-hidden">
      {/* Main Layout: Left Sidebar + Right Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full relative z-10 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex ${
            isSidebarCollapsed ? 'w-20 pl-3 pr-0 py-5' : 'w-64 pl-5 pr-0 py-5'
          } bg-gradient-to-b from-[#274c77] via-[#1e3b5e] to-[#14263e] flex-col shrink-0 justify-between transition-all duration-300 ease-in-out shadow-2xl relative z-20`}
        >
          <div>
            {/* Brand Logo & Collapse Toggle */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center pr-1' : 'justify-between pr-4'} px-1 mb-8`}>
              <div 
                className={`flex items-center gap-2.5 overflow-hidden transition-all ${isSidebarCollapsed ? 'cursor-ew-resize hover:scale-105' : ''}`}
                onClick={isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined}
                title={isSidebarCollapsed ? 'Expand Sidebar' : undefined}
              >
                {/* Concentric Brand Logo Mark */}
                <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/40 bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#274c77]" />
                    </div>
                  </div>
                </div>

                {!isSidebarCollapsed && (
                  <span className="text-xl tracking-tight !text-white font-heading font-medium">
                    Bookify
                  </span>
                )}
              </div>

              {/* Collapse Button (Only shown when expanded) */}
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Navigation Sections */}
            <div className="space-y-6">
              {/* SECTION 1: Workspace */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Workspace
                  </div>
                )}
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: LayoutGrid },
                    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: appointments.filter(a => a.status === 'no_show').length > 0 ? appointments.filter(a => a.status === 'no_show').length.toString() : undefined },
                    { id: 'customers', label: 'Customers', icon: Users },
                    { id: 'services', label: 'Services', icon: Scissors },
                    { id: 'availability', label: 'Availability', icon: Clock },
                    { id: 'builder', label: 'Booking Form', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        title={isSidebarCollapsed ? item.label : undefined}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (item.id !== 'bookings') setSelectedAppointment(null);
                        }}
                        className={`flex items-center transition-colors duration-200 cursor-pointer text-sm font-medium relative ${
                          isSidebarCollapsed
                            ? `w-full justify-center py-3 rounded-l-2xl ${isActive ? 'sidebar-nav-active text-[#274c77]' : 'text-white/60 hover:text-white hover:bg-white/10'}`
                            : isActive
                              ? 'w-full px-4 py-3 sidebar-nav-active text-[#274c77]'
                              : 'w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-l-2xl'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#274c77]' : 'text-white/60'
                            }`}
                          />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {!isSidebarCollapsed && !isActive && item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white mr-4">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* SECTION 2: Growth */}
              <div>
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Growth
                  </div>
                )}
                <nav className="space-y-1">
                  <button
                    title={isSidebarCollapsed ? 'Analytics' : undefined}
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center transition-colors duration-200 cursor-pointer text-sm font-medium relative ${
                      isSidebarCollapsed
                        ? `w-full justify-center py-3 rounded-l-2xl ${activeTab === 'analytics' ? 'sidebar-nav-active text-[#274c77]' : 'text-white/60 hover:text-white hover:bg-white/10'}`
                        : activeTab === 'analytics'
                          ? 'w-full px-4 py-3 sidebar-nav-active text-[#274c77]'
                          : 'w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-l-2xl'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          activeTab === 'analytics' ? 'text-[#274c77]' : 'text-white/60'
                        }`}
                      />
                      {!isSidebarCollapsed && <span>Analytics</span>}
                    </div>
                  </button>
                </nav>
              </div>

              {/* SECTION 3: Workspace Settings */}
              <div className="pb-4">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Workspace Settings
                  </div>
                )}
                <nav className="space-y-1">
                  {[
                    { id: 'branding', label: 'Branding', icon: PenTool },
                    { id: 'integrations', label: 'Integrations', icon: Puzzle },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={`${item.id}_${idx}`}
                        title={isSidebarCollapsed ? item.label : undefined}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (item.id !== 'bookings') setSelectedAppointment(null);
                        }}
                        className={`flex items-center transition-colors duration-200 cursor-pointer text-sm font-medium relative ${
                          isSidebarCollapsed
                            ? `w-full justify-center py-3 rounded-l-2xl ${isActive ? 'sidebar-nav-active text-[#274c77]' : 'text-white/60 hover:text-white hover:bg-white/10'}`
                            : isActive
                              ? 'w-full px-4 py-3 sidebar-nav-active text-[#274c77]'
                              : 'w-full px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-l-2xl'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#274c77]' : 'text-white/60'
                            }`}
                          />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                      </button>
                    );
                  })}

                  {/* Help Link */}
                  <button
                    title={isSidebarCollapsed ? 'Help & Strategy' : undefined}
                    onClick={() => setIsStrategyModalOpen(true)}
                    className={`flex items-center ${
                      isSidebarCollapsed ? 'w-full justify-center py-3 rounded-l-2xl' : 'w-full justify-between px-4 py-3 rounded-l-2xl'
                    } text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer mt-2`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && <span>Help</span>}
                    </div>
                    {!isSidebarCollapsed && <span className="text-[10px] text-white/40 mr-4">👤</span>}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER & BACKDROP OVERLAY */}
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden animate-in fade-in"
            />
            <aside className="fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-[#274c77] via-[#1e3b5e] to-[#14263e] z-50 p-5 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto animate-in slide-in-from-left duration-300">
              <div>
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between px-1 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/40 bg-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#274c77]" />
                        </div>
                      </div>
                    </div>
                    <span className="text-xl tracking-tight !text-white font-heading font-medium">
                      Bookify
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Drawer Navigation Links */}
                <div className="space-y-6">
                  <div>
                    <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Workspace
                    </div>
                    <nav className="space-y-1">
                      {[
                        { id: 'overview', label: 'Overview', icon: LayoutGrid },
                        { id: 'bookings', label: 'Bookings', icon: Calendar, badge: appointments.filter(a => a.status === 'no_show').length > 0 ? appointments.filter(a => a.status === 'no_show').length.toString() : undefined },
                        { id: 'customers', label: 'Customers', icon: Users },
                        { id: 'services', label: 'Services', icon: Scissors },
                        { id: 'availability', label: 'Availability', icon: Clock },
                        { id: 'builder', label: 'Booking Form', icon: FileText },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              if (item.id !== 'bookings') setSelectedAppointment(null);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-white/20 text-white font-bold'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div>
                    <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Growth
                    </div>
                    <nav className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('analytics');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                          activeTab === 'analytics'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 shrink-0" />
                        <span>Analytics</span>
                      </button>
                    </nav>
                  </div>

                  <div>
                    <div className="px-3 text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Workspace Settings
                    </div>
                    <nav className="space-y-1">
                      {[
                        { id: 'branding', label: 'Branding', icon: PenTool },
                        { id: 'integrations', label: 'Integrations', icon: Puzzle },
                        { id: 'settings', label: 'Settings', icon: Settings },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={`m_${item.id}_${idx}`}
                            onClick={() => {
                              setActiveTab(item.id);
                              if (item.id !== 'bookings') setSelectedAppointment(null);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-white/20 text-white font-bold'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          setIsStrategyModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer mt-2"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 shrink-0" />
                          <span>Help & Strategy</span>
                        </div>
                        <span className="text-xs">👤</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* RIGHT VIEWPORT: Header + Content Container */}
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-2">
            {/* Left: Mobile Menu Toggle + Business Switcher */}
            <div className="flex items-center gap-2.5">
              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl glass-card text-[#274c77] hover:bg-white/60 transition-colors cursor-pointer"
                title="Open Mobile Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative">
                <div
                  onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl glass-card transition-all cursor-pointer select-none border border-white/40 hover:bg-white/60 flex flex-col justify-center"
                >
                  <span className="text-[8px] sm:text-[9px] font-semibold text-[#8b8c89] block leading-tight">
                    Business Switcher
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-bold text-[#274c77] font-heading truncate max-w-[110px] sm:max-w-none">
                      {activeBusiness.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6096ba] shrink-0" />
                  </div>
                </div>

                {isBusinessDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 py-2 z-50 animate-in fade-in duration-200 slide-in-from-top-2">
                    <div className="px-3.5 py-2 text-[10px] font-bold text-[#6096ba] uppercase tracking-wider">
                      Select Tenant
                    </div>
                    {businesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBusiness(b.id)}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                          b.id === activeBusiness.id
                            ? 'bg-white/50 text-[#274c77] font-bold border-l-2 border-[#274c77]'
                            : 'text-[#274c77] hover:bg-white/40'
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        <span className="text-[10px] text-[#8b8c89] capitalize">
                          {b.industryCategory.replace('_', ' ')}
                        </span>
                      </button>
                    ))}

                    <div className="pt-2 mt-1 border-t border-white/30 px-2">
                      <button
                        onClick={handleStartOnboarding}
                        className="w-full text-left px-2 py-2 text-xs text-[#274c77] hover:bg-white/50 font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Create Business
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions, Notifications, User Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Preview Link */}
              <button
                onClick={() => setPreviewPublicSlug(activeBusiness.slug)}
                className="hidden xs:inline-block text-xs font-semibold text-[#6096ba] hover:text-[#274c77] transition-colors cursor-pointer"
              >
                Preview
              </button>

              {/* View Booking Page Link */}
              <button
                onClick={() => setPreviewPublicSlug(activeBusiness.slug)}
                className="text-xs font-semibold text-[#6096ba] hover:text-[#274c77] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden sm:inline">View </span>Booking Page
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-[#274c77] hover:bg-white/60 relative transition-all cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#a3cef1] border border-white" />
              </button>

              {/* Help Question Icon */}
              <button
                onClick={() => setIsStrategyModalOpen(true)}
                className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-[#274c77] hover:bg-white/60 transition-all cursor-pointer shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/40">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/40 border border-white/60 flex items-center justify-center text-[#274c77] text-xs font-bold overflow-hidden shadow-sm shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                    alt="Aayan Qureshi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-[#274c77] block leading-tight">
                    Aayan Qureshi
                  </span>
                  <span className="text-[10px] text-[#6096ba] block leading-tight">
                    aqureshi.1020@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </header>

            {/* Notification Toast Dropdown */}
            {showNotificationToast && (
              <div className="mx-6 mt-4 p-4 glass-panel rounded-2xl text-xs text-[#274c77] flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4">
                <span>
                  <strong>New Booking Received:</strong> Sarah Jenkins booked "Develop API Endpoints" for tomorrow.
                </span>
                <button
                  onClick={() => setShowNotificationToast(false)}
                  className="font-bold underline text-[11px] ml-2 text-[#6096ba] hover:text-[#274c77]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Workspace Content (Fits on Single Viewport with clean responsive flow) */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
              <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                {activeTab === 'builder' ? (
                  <FormBuilder
                    business={activeBusiness}
                    onPreviewPublic={() => setPreviewPublicSlug(activeBusiness.slug)}
                  />
                ) : (
                  <>
                    {activeTab === 'overview' && (
                      <OverviewTab
                        business={activeBusiness}
                        appointments={appointments}
                        services={services}
                        onNavigateTab={(tab) => {
                          setActiveTab(tab);
                          if (tab !== 'bookings') setSelectedAppointment(null);
                        }}
                        onSelectAppointment={(app) => {
                          setSelectedAppointment(app);
                          setActiveTab('bookings');
                        }}
                        onOpenPublicBooking={() => setPreviewPublicSlug(activeBusiness.slug)}
                      />
                    )}

                    {activeTab === 'bookings' && (
                      <BookingsTab
                        businessId={activeBusiness.id}
                        appointments={appointments}
                        services={services}
                        onRefresh={refreshData}
                        selectedAppointment={selectedAppointment}
                        onSelectAppointment={setSelectedAppointment}
                      />
                    )}

                    {activeTab === 'customers' && (
                      <CustomersTab
                        businessId={activeBusiness.id}
                        onRefresh={refreshData}
                      />
                    )}

                    {activeTab === 'services' && (
                      <ServicesTab
                        businessId={activeBusiness.id}
                        services={services}
                        onRefresh={refreshData}
                      />
                    )}

                    {activeTab === 'availability' && (
                      <AvailabilityTab businessId={activeBusiness.id} />
                    )}

                    {activeTab === 'analytics' && (
                      <AnalyticsTab businessId={activeBusiness.id} />
                    )}

                    {activeTab === 'integrations' && (
                      <IntegrationsTab business={activeBusiness} />
                    )}

                    {activeTab === 'settings' && (
                      <SettingsTab
                        business={activeBusiness}
                        onRefresh={refreshData}
                        onNavigateToBranding={() => setActiveTab('branding')}
                      />
                    )}

                    {activeTab === 'branding' && (
                      <BrandingTab
                        business={activeBusiness}
                        onRefresh={refreshData}
                        onNavigateToForm={() => setActiveTab('builder')}
                      />
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>

      {/* Product Strategy & Methodology Documentation Modal */}
      <ProductStrategyModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
      />
    </div>
  );
}
